import { config } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

const REVERSE_GEOCODE_URL = 'https://nominatim.openstreetmap.org/reverse';
const REVERSE_GEOCODE_TIMEOUT_MS = 8000;

const firstText = (...values) =>
  values.map(value => String(value || '').trim()).find(Boolean) || '';

const joinText = (...values) =>
  values.map(value => String(value || '').trim()).filter(Boolean).join(', ');

const getDisplayParts = displayName =>
  String(displayName || '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

const buildStreetLine = address => {
  const street = firstText(
    address.road,
    address.pedestrian,
    address.footway,
    address.path,
    address.residential,
    address.hamlet
  );

  return joinText(address.house_number, street);
};

const mapNominatimAddress = (payload, fallbackCoordinates) => {
  const address = payload.address || {};
  const displayParts = getDisplayParts(payload.display_name);
  const locality = firstText(address.neighbourhood, address.suburb, address.quarter);
  const district = firstText(address.city_district, address.state_district, address.county);

  return {
    line1: firstText(buildStreetLine(address), displayParts[0], locality),
    line2: firstText(joinText(locality, district), displayParts.slice(1, 3).join(', ')),
    city: firstText(address.city, address.town, address.village, address.municipality, address.county),
    state: firstText(address.state, address.region),
    postalCode: firstText(address.postcode),
    country: firstText(address.country, 'India'),
    coordinates: {
      latitude: Number(payload.lat) || fallbackCoordinates.lat,
      longitude: Number(payload.lon) || fallbackCoordinates.lng
    }
  };
};

export const reverseGeocodeService = {
  async reverse({ lat, lng }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REVERSE_GEOCODE_TIMEOUT_MS);
    const params = new URLSearchParams({
      format: 'jsonv2',
      addressdetails: '1',
      lat: String(lat),
      lon: String(lng)
    });

    try {
      const response = await fetch(`${REVERSE_GEOCODE_URL}?${params}`, {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'en-IN,en;q=0.9',
          'User-Agent': `DoonSilk/1.0 (${config.API_BASE_URL})`
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new ApiError(502, 'Could not resolve this location right now');
      }

      const payload = await response.json();
      if (!payload?.address && !payload?.display_name) {
        throw ApiError.notFound('No address found for this location');
      }

      return mapNominatimAddress(payload, { lat, lng });
    } catch (error) {
      if (error instanceof ApiError) throw error;

      const message = error?.name === 'AbortError'
        ? 'Location lookup timed out. Please try again.'
        : 'Could not resolve this location right now';

      throw new ApiError(502, message);
    } finally {
      clearTimeout(timeout);
    }
  }
};
