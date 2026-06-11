"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import type { RankedListing } from "@/lib/types";

type MapPanelProps = {
  listings: RankedListing[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function pinIcon(score: number, selected: boolean) {
  return L.divIcon({
    className: "",
    html: `<div class="${selected ? "healthy-pin healthy-pin-selected" : "healthy-pin"}">${score}</div>`,
    iconSize: selected ? [38, 38] : [30, 30],
    iconAnchor: selected ? [19, 19] : [15, 15]
  });
}

export default function MapPanel({ listings, selectedId, onSelect }: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [43.384, -70.537],
      zoom: 11,
      scrollWheelZoom: true,
      zoomControl: true
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.circle([43.384, -70.537], {
      radius: 16093,
      color: "#0b63ce",
      weight: 2,
      fillColor: "#0b63ce",
      fillOpacity: 0.08
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      markerLayerRef.current?.clearLayers();
      markerLayerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    listings.forEach((listing) => {
      const marker = L.marker([listing.lat, listing.lng], {
        icon: pinIcon(listing.score, listing.id === selectedId)
      });
      marker.bindTooltip(`<strong>${listing.town}</strong>: ${listing.score}`, {
        direction: "top",
        offset: [0, -10],
        opacity: 1
      });
      marker.on("click", () => onSelectRef.current(listing.id));
      marker.addTo(layer);
    });

    const selected = listings.find((listing) => listing.id === selectedId) ?? listings[0];
    if (selected) {
      map.setView([selected.lat, selected.lng], 11, { animate: true });
    }
  }, [listings, selectedId]);

  return <div ref={containerRef} className="h-full min-h-[360px] overflow-hidden rounded-lg" />;
}
