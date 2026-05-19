export interface POIDistance {
  name: string;
  km: number;
  mins: number;
}

export interface Property {
  id: number;
  name: string;
  developer: string;
  price_raw: string;
  price_min: number;
  price_max: number;
  bedrooms_text: string;
  bedrooms: number[];
  locality: string;
  region: string;
  postal_code: string;
  lat: number;
  lng: number;
  url: string;
  images: string[];
  nearest_school: POIDistance;
  nearest_station: POIDistance;
  nearest_park: POIDistance;
  description?: string;
}

export const properties: Property[] = [
  {
    id: 26129,
    name: "The Willows",
    developer: "Persimmon Homes",
    price_raw: "£284,995 - £315,995",
    price_min: 284995,
    price_max: 315995,
    bedrooms_text: "3 bedroom houses",
    bedrooms: [3],
    locality: "Edinburgh",
    region: "Edinburgh City",
    postal_code: "EH16 4DD",
    lat: 55.929199,
    lng: -3.11192,
    url: "https://www.newhomesforsale.co.uk/new-homes/edinburgh-city/edinburgh/the-willows-persimmon-homes/",
    images: ["/images/26129/001.jpeg", "/images/26129/002.jpeg", "/images/26129/003.jpeg", "/images/26129/004.jpeg", "/images/26129/005.jpeg"],
    nearest_school: { name: "Castleview Primary", km: 0.3, mins: 4 },
    nearest_station: { name: "Brunstane", km: 1.0, mins: 12 },
    nearest_park: { name: "Figgate Burn Park", km: 0.7, mins: 8 },
    description: "A new development in Edinburgh by Persimmon Homes featuring 3 bedroom houses in a sought-after location with excellent local amenities and great transport links.",
  },
  {
    id: 29137,
    name: "Bellway at Shawfair",
    developer: "Bellway",
    price_raw: "£316,995 - £537,995",
    price_min: 316995,
    price_max: 537995,
    bedrooms_text: "3 & 4 bedroom houses",
    bedrooms: [3, 4],
    locality: "Edinburgh",
    region: "Edinburgh City",
    postal_code: "EH22 1FD",
    lat: 55.91904,
    lng: -3.11349,
    url: "https://www.newhomesforsale.co.uk/new-homes/edinburgh-city/edinburgh/bellway-at-shawfair/",
    images: ["/images/29137/002.jpeg", "/images/29137/003.jpeg", "/images/29137/004.jpeg", "/images/29137/005.jpeg"],
    nearest_school: { name: "Castleview Primary", km: 0.8, mins: 10 },
    nearest_station: { name: "Shawfair", km: 1.7, mins: 20 },
    nearest_park: { name: "Figgate Burn Park", km: 1.9, mins: 23 },
    description: "A premium Bellway development at Shawfair offering spacious 3 and 4 bedroom family homes with contemporary design and excellent connectivity to Edinburgh city centre.",
  },
  {
    id: 31188,
    name: "Edgelaw View",
    developer: "Miller Homes",
    price_raw: "£229,000 - £479,000",
    price_min: 229000,
    price_max: 479000,
    bedrooms_text: "2 bedroom apartments and 3 & 4 bedroom houses",
    bedrooms: [2, 3, 4],
    locality: "Edinburgh",
    region: "Edinburgh City",
    postal_code: "EH17 8SD",
    lat: 55.894798,
    lng: -3.14575,
    url: "https://www.newhomesforsale.co.uk/new-homes/edinburgh-city/edinburgh/edgelaw-view-miller-homes/",
    images: ["/images/31188/001.jpeg", "/images/31188/002.jpeg", "/images/31188/003.jpeg", "/images/31188/004.jpeg"],
    nearest_school: { name: "Gracemount Primary", km: 0.4, mins: 5 },
    nearest_station: { name: "Shawfair", km: 4.4, mins: 53 },
    nearest_park: { name: "Craigmillar Park", km: 3.3, mins: 40 },
    description: "Miller Homes' Edgelaw View offers a superb range of 2 bedroom apartments and 3 & 4 bedroom houses in south Edinburgh, with excellent local schools and a range of amenities.",
  },
  {
    id: 31873,
    name: "Cammo Meadows",
    developer: "David Wilson Homes",
    price_raw: "£404,995 - £514,995",
    price_min: 404995,
    price_max: 514995,
    bedrooms_text: "4 bedroom houses",
    bedrooms: [4],
    locality: "Edinburgh",
    region: "Edinburgh City",
    postal_code: "EH4 8FD",
    lat: 55.960201,
    lng: -3.30903,
    url: "https://www.newhomesforsale.co.uk/new-homes/edinburgh-city/edinburgh/cammo-meadows-david-wilson-homes/",
    images: ["/images/31873/002.jpeg", "/images/31873/003.jpeg", "/images/31873/005.jpeg"],
    nearest_school: { name: "Craigmount High", km: 1.5, mins: 18 },
    nearest_station: { name: "South Gyle", km: 2.9, mins: 35 },
    nearest_park: { name: "Cammo Estate", km: 0.4, mins: 5 },
    description: "Nestled beside the beautiful Cammo Estate, David Wilson Homes' Cammo Meadows offers stunning 4 bedroom family homes with countryside views and easy access to Edinburgh's west side.",
  },
  {
    id: 34931,
    name: "Tram Sheds at The Engine Yard",
    developer: "Places for People",
    price_raw: "£285,000 - £565,000",
    price_min: 285000,
    price_max: 565000,
    bedrooms_text: "1, 2 & 3 bedroom properties",
    bedrooms: [1, 2, 3],
    locality: "Edinburgh",
    region: "Edinburgh City",
    postal_code: "EH7 4RB",
    lat: 55.963001,
    lng: -3.18236,
    url: "https://www.newhomesforsale.co.uk/new-homes/edinburgh-city/edinburgh/tram-sheds-at-the-engine-yard/",
    images: ["/images/34931/001.jpeg", "/images/34931/002.jpeg", "/images/34931/003.jpeg", "/images/34931/004.jpeg"],
    nearest_school: { name: "James Gillespie's", km: 3.0, mins: 36 },
    nearest_station: { name: "Edinburgh Waverley", km: 1.3, mins: 16 },
    nearest_park: { name: "Inverleith Park", km: 1.4, mins: 17 },
    description: "A landmark development by Places for People in the heart of Leith, offering 1, 2 & 3 bedroom properties with stunning heritage architecture, minutes from the city centre.",
  },
  {
    id: 34950,
    name: "West Craigs Manor",
    developer: "Miller Homes",
    price_raw: "£369,000 - £705,000",
    price_min: 369000,
    price_max: 705000,
    bedrooms_text: "3, 4 & 5 bedroom houses and 3 bedroom townhouses",
    bedrooms: [3, 4, 5],
    locality: "Edinburgh",
    region: "Edinburgh City",
    postal_code: "EH12 8FR",
    lat: 55.948898,
    lng: -3.32138,
    url: "https://www.newhomesforsale.co.uk/new-homes/edinburgh-city/edinburgh/west-craigs-manor-miller-homes/",
    images: ["/images/34950/013.jpeg", "/images/34950/014.jpeg", "/images/34950/015.jpeg", "/images/34950/016.jpeg"],
    nearest_school: { name: "Craigmount High", km: 1.8, mins: 22 },
    nearest_station: { name: "South Gyle", km: 1.9, mins: 23 },
    nearest_park: { name: "Cammo Estate", km: 1.8, mins: 22 },
    description: "Miller Homes' prestigious West Craigs Manor development offers an exclusive collection of 3, 4 & 5 bedroom homes and townhouses in west Edinburgh with excellent commuter links.",
  },
  {
    id: 37484,
    name: "Edmonstone Village",
    developer: "Avant Homes",
    price_raw: "£289,995 - £486,995",
    price_min: 289995,
    price_max: 486995,
    bedrooms_text: "3, 4 & 5 bedroom houses",
    bedrooms: [3, 4, 5],
    locality: "Edinburgh",
    region: "Edinburgh City",
    postal_code: "EH16 4SP",
    lat: 55.911999,
    lng: -3.12691,
    url: "https://www.newhomesforsale.co.uk/new-homes/edinburgh-city/edinburgh/edmonstone-village-avant-homes/",
    images: ["/images/37484/001.jpeg", "/images/37484/002.jpeg", "/images/37484/003.jpeg", "/images/37484/004.jpeg"],
    nearest_school: { name: "Gilmerton Primary", km: 1.0, mins: 12 },
    nearest_station: { name: "Shawfair", km: 2.5, mins: 30 },
    nearest_park: { name: "Craigmillar Park", km: 2.1, mins: 25 },
    description: "Avant Homes' Edmonstone Village is an exciting new community offering 3, 4 & 5 bedroom family homes in south Edinburgh, with great schools nearby and easy access to the city.",
  },
  {
    id: 37522,
    name: "West Craigs",
    developer: "Cala Homes",
    price_raw: "£299,995 - £644,995",
    price_min: 299995,
    price_max: 644995,
    bedrooms_text: "2 & 3 bedroom apartments and 3 & 4 bedroom houses",
    bedrooms: [2, 3, 4],
    locality: "Edinburgh",
    region: "Edinburgh City",
    postal_code: "EH12 0ED",
    lat: 55.950802,
    lng: -3.3297,
    url: "https://www.newhomesforsale.co.uk/new-homes/edinburgh-city/edinburgh/west-craigs-cala-homes/",
    images: ["/images/37522/001.jpeg", "/images/37522/006.jpeg", "/images/37522/007.jpeg", "/images/37522/008.jpeg"],
    nearest_school: { name: "Craigmount High", km: 2.3, mins: 28 },
    nearest_station: { name: "Edinburgh Gateway", km: 2.0, mins: 24 },
    nearest_park: { name: "Cammo Estate", km: 2.0, mins: 24 },
    description: "Cala Homes' West Craigs development offers a premium collection of 2 & 3 bedroom apartments and 3 & 4 bedroom houses, with superb specification and excellent transport links.",
  },
  {
    id: 39771,
    name: "West Craigs Quarter",
    developer: "David Wilson Homes",
    price_raw: "£409,995 - £599,995",
    price_min: 409995,
    price_max: 599995,
    bedrooms_text: "4 bedroom houses",
    bedrooms: [4],
    locality: "Edinburgh",
    region: "Edinburgh City",
    postal_code: "EH12 0EP",
    lat: 55.947754,
    lng: -3.334468,
    url: "https://www.newhomesforsale.co.uk/new-homes/edinburgh-city/edinburgh/west-craigs-quarter-david-wilson-homes/",
    images: ["/images/39771/001.jpeg", "/images/39771/002.jpeg", "/images/39771/007.jpeg"],
    nearest_school: { name: "Craigmount High", km: 2.6, mins: 31 },
    nearest_station: { name: "Edinburgh Gateway", km: 1.8, mins: 22 },
    nearest_park: { name: "Cammo Estate", km: 2.5, mins: 30 },
    description: "David Wilson Homes presents West Craigs Quarter, offering exceptional 4 bedroom family homes in west Edinburgh with high-quality finishes and outstanding connectivity.",
  },
  {
    id: 41956,
    name: "West Craigs Mews",
    developer: "Miller Homes",
    price_raw: "£499,000 - £680,000",
    price_min: 499000,
    price_max: 680000,
    bedrooms_text: "4 & 5 bedroom houses",
    bedrooms: [4, 5],
    locality: "Edinburgh",
    region: "Edinburgh City",
    postal_code: "EH12 0AD",
    lat: 55.951827,
    lng: -3.339421,
    url: "https://www.newhomesforsale.co.uk/new-homes/edinburgh-city/edinburgh/west-craigs-mews-miller-homes/",
    images: ["/images/41956/005.jpeg", "/images/41956/006.jpeg", "/images/41956/007.jpeg", "/images/41956/008.jpeg"],
    nearest_school: { name: "Craigmount High", km: 2.9, mins: 35 },
    nearest_station: { name: "Edinburgh Gateway", km: 1.4, mins: 17 },
    nearest_park: { name: "Cammo Estate", km: 2.5, mins: 30 },
    description: "Miller Homes' West Craigs Mews presents a prestigious collection of 4 & 5 bedroom homes, combining luxury specification with exceptional design in a prime west Edinburgh location.",
  },
  {
    id: 43010,
    name: "West Craigs",
    developer: "Taylor Wimpey",
    price_raw: "£364,995 - £589,995",
    price_min: 364995,
    price_max: 589995,
    bedrooms_text: "2, 3 & 4 bedroom houses",
    bedrooms: [2, 3, 4],
    locality: "Edinburgh",
    region: "Edinburgh City",
    postal_code: "EH12 8FE",
    lat: 55.947273,
    lng: -3.316436,
    url: "https://www.newhomesforsale.co.uk/new-homes/edinburgh-city/edinburgh/west-craigs-taylor-wimpey/",
    images: ["/images/43010/002.jpeg", "/images/43010/003.jpeg", "/images/43010/004.jpeg", "/images/43010/005.jpeg"],
    nearest_school: { name: "Craigmount High", km: 1.5, mins: 18 },
    nearest_station: { name: "South Gyle", km: 1.6, mins: 19 },
    nearest_park: { name: "Cammo Estate", km: 1.8, mins: 22 },
    description: "Taylor Wimpey's West Craigs development offers a superb range of 2, 3 & 4 bedroom homes in a thriving new community in west Edinburgh with excellent schools and great transport links.",
  },
];

export function getProperty(id: number): Property | undefined {
  return properties.find((p) => p.id === id);
}

export interface SearchFilters {
  beds?: number;
  max_price?: number;
  min_price?: number;
  near?: string[];
  keywords?: string[];
}

export interface SearchResult {
  property: Property;
  score: number;
  explanation: string;
}

export function searchProperties(filters: SearchFilters): SearchResult[] {
  const results: SearchResult[] = [];

  for (const prop of properties) {
    let score = 100;
    const reasons: string[] = [];
    const misses: string[] = [];

    if (filters.beds !== undefined) {
      if (prop.bedrooms.includes(filters.beds)) {
        score += 30;
        reasons.push(`${filters.beds}-bedroom homes available`);
      } else if (prop.bedrooms.some((b) => Math.abs(b - filters.beds!) <= 1)) {
        score += 10;
        reasons.push(`${prop.bedrooms.join(" & ")}-bedroom homes available`);
      } else {
        misses.push("bedroom count");
        score -= 50;
      }
    }

    if (filters.max_price !== undefined) {
      if (prop.price_min <= filters.max_price) {
        score += 20;
        if (prop.price_max <= filters.max_price) {
          reasons.push(`all homes within your £${(filters.max_price / 1000).toFixed(0)}k budget`);
        } else {
          reasons.push(`homes from £${(prop.price_min / 1000).toFixed(0)}k within your budget`);
        }
      } else {
        misses.push("price range");
        score -= 60;
      }
    }

    if (filters.near?.includes("school")) {
      if (prop.nearest_school.km <= 0.5) {
        score += 40;
        reasons.push(`${prop.nearest_school.name} is just ${prop.nearest_school.mins} min walk`);
      } else if (prop.nearest_school.km <= 1.5) {
        score += 20;
        reasons.push(`${prop.nearest_school.name} is ${prop.nearest_school.mins} min away`);
      } else {
        score -= 10;
        reasons.push(`${prop.nearest_school.name} is ${prop.nearest_school.km}km away`);
      }
    }

    if (filters.near?.includes("station") || filters.near?.includes("transport")) {
      if (prop.nearest_station.km <= 1.0) {
        score += 30;
        reasons.push(`${prop.nearest_station.name} station is ${prop.nearest_station.mins} min walk`);
      } else if (prop.nearest_station.km <= 2.5) {
        score += 15;
        reasons.push(`${prop.nearest_station.name} station is ${prop.nearest_station.km}km away`);
      }
    }

    if (filters.near?.includes("park")) {
      if (prop.nearest_park.km <= 0.5) {
        score += 25;
        reasons.push(`${prop.nearest_park.name} is just ${prop.nearest_park.mins} min walk`);
      } else if (prop.nearest_park.km <= 1.5) {
        score += 12;
        reasons.push(`${prop.nearest_park.name} is ${prop.nearest_park.mins} min away`);
      }
    }

    if (score >= 50) {
      const explanation = buildExplanation(prop, filters, reasons);
      results.push({ property: prop, score, explanation });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function buildExplanation(prop: Property, filters: SearchFilters, reasons: string[]): string {
  if (reasons.length === 0) {
    return `${prop.name} is a new-build development in ${prop.locality} by ${prop.developer}.`;
  }

  const parts = reasons.slice(0, 3);
  const schoolStr =
    prop.nearest_school.km <= 1.0
      ? `within walking distance of ${prop.nearest_school.name}`
      : `near ${prop.nearest_school.name}`;

  if (filters.near?.includes("school")) {
    return `${prop.name} matches your search — it has ${parts.join(", ")}. Ideal for families, it is ${schoolStr} (${prop.nearest_school.mins} min).`;
  }
  return `${prop.name} is a great match — ${parts.join(", ")}. Located in ${prop.locality} by ${prop.developer}.`;
}
