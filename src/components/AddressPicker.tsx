import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

export interface AddressValue {
  address: string;
  lat: number | null;
  lng: number | null;
}

interface Props {
  value: AddressValue;
  onChange: (v: AddressValue) => void;
}

const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 }; // Lagos

const AddressPicker = ({ value, onChange }: Props) => {
  const { ready, available } = useGoogleMaps();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [localQuery, setLocalQuery] = useState(value.address || "");

  // Initialize map + autocomplete once ready
  useEffect(() => {
    if (!ready || !available || !mapDivRef.current || !inputRef.current) return;
    const g = window.google;

    const center =
      value.lat != null && value.lng != null ? { lat: value.lat, lng: value.lng } : DEFAULT_CENTER;

    const map = new g.maps.Map(mapDivRef.current, {
      center,
      zoom: value.lat != null ? 16 : 12,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
      clickableIcons: false,
    });
    mapRef.current = map;

    const marker = new g.maps.Marker({
      position: center,
      map,
      draggable: true,
    });
    markerRef.current = marker;

    const geocoder = new g.maps.Geocoder();

    const setFromLatLng = (latLng: any) => {
      geocoder.geocode({ location: latLng }, (results: any[], status: string) => {
        const addr = status === "OK" && results?.[0]?.formatted_address ? results[0].formatted_address : "";
        const next = { address: addr, lat: latLng.lat(), lng: latLng.lng() };
        setLocalQuery(next.address);
        onChange(next);
      });
    };

    marker.addListener("dragend", () => setFromLatLng(marker.getPosition()));
    map.addListener("click", (e: any) => {
      marker.setPosition(e.latLng);
      setFromLatLng(e.latLng);
    });

    const ac = new g.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry"],
    });
    ac.bindTo("bounds", map);
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place.geometry?.location) return;
      const loc = place.geometry.location;
      map.setCenter(loc);
      map.setZoom(16);
      marker.setPosition(loc);
      const next = {
        address: place.formatted_address || "",
        lat: loc.lat(),
        lng: loc.lng(),
      };
      setLocalQuery(next.address);
      onChange(next);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, available]);

  // Fallback (no API key): plain text input
  if (!available) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="address" className="text-xs">Business Address</Label>
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="address"
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            placeholder="123 Allen Ave, Ikeja, Lagos"
            className="pl-9"
          />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Map picker will activate once Google Maps is configured.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="address" className="text-xs">Business Address</Label>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          id="address"
          value={localQuery}
          onChange={(e) => {
            setLocalQuery(e.target.value);
            onChange({ ...value, address: e.target.value });
          }}
          placeholder="Search for your business address"
          className="pl-9"
          autoComplete="off"
        />
      </div>
      <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-muted">
        <div ref={mapDivRef} className="absolute inset-0" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Tap the map or drag the pin to set your exact location.
      </p>
    </div>
  );
};

export default AddressPicker;
