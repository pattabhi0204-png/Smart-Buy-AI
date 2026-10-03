/**
 * Utility to generate deep product search and listing URLs for verified in-country retailers.
 * This ensures clicking retailer buttons always opens the exact product query/results page
 * rather than dumping the user on the retailer's generic home page.
 */

export function sanitizeProductSearchQuery(name: string, brand?: string, model?: string): string {
  // Remove extraneous noise or promotional suffixes
  let query = (name || '').trim();
  if (brand && !query.toLowerCase().includes(brand.toLowerCase())) {
    query = `${brand} ${query}`;
  }
  if (model && !query.toLowerCase().includes(model.toLowerCase())) {
    query = `${query} ${model}`;
  }
  // Trim excessive length for search engines (keep first 60 chars or up to 6 words)
  const words = query.split(/\s+/).filter(Boolean);
  return words.slice(0, 7).join(' ');
}

export function buildRetailerProductUrl(
  platformNameOrDomain: string,
  productQuery: string,
  countryCode: string = 'US'
): string {
  const query = encodeURIComponent(productQuery.trim());
  const platform = platformNameOrDomain.toLowerCase().trim();
  const cCode = countryCode.toUpperCase();

  // 1. Amazon (region-specific deep search)
  if (platform.includes('amazon')) {
    if (cCode === 'IN' || platform.includes('.in')) {
      return `https://www.amazon.in/s?k=${query}&ref=nb_sb_noss`;
    }
    if (cCode === 'GB' || cCode === 'UK' || platform.includes('.co.uk')) {
      return `https://www.amazon.co.uk/s?k=${query}&ref=nb_sb_noss`;
    }
    if (cCode === 'DE' || platform.includes('.de')) {
      return `https://www.amazon.de/s?k=${query}&ref=nb_sb_noss`;
    }
    if (cCode === 'CA' || platform.includes('.ca')) {
      return `https://www.amazon.ca/s?k=${query}&ref=nb_sb_noss`;
    }
    if (cCode === 'AU' || platform.includes('.com.au')) {
      return `https://www.amazon.com.au/s?k=${query}&ref=nb_sb_noss`;
    }
    if (cCode === 'JP' || platform.includes('.co.jp')) {
      return `https://www.amazon.co.jp/s?k=${query}&ref=nb_sb_noss`;
    }
    if (cCode === 'AE' || platform.includes('.ae')) {
      return `https://www.amazon.ae/s?k=${query}&ref=nb_sb_noss`;
    }
    return `https://www.amazon.com/s?k=${query}&ref=nb_sb_noss`;
  }

  // 2. Flipkart (India)
  if (platform.includes('flipkart')) {
    return `https://www.flipkart.com/search?q=${query}&otracker=search&otracker1=search`;
  }

  // 3. Best Buy (US / CA)
  if (platform.includes('best buy') || platform.includes('bestbuy')) {
    if (cCode === 'CA' || platform.includes('.ca')) {
      return `https://www.bestbuy.ca/en-ca/search?search=${query}`;
    }
    return `https://www.bestbuy.com/site/searchpage.jsp?st=${query}`;
  }

  // 4. Walmart (US / CA)
  if (platform.includes('walmart')) {
    if (cCode === 'CA' || platform.includes('.ca')) {
      return `https://www.walmart.ca/search?q=${query}`;
    }
    return `https://www.walmart.com/search?q=${query}`;
  }

  // 5. Target (US)
  if (platform.includes('target')) {
    return `https://www.target.com/s?searchTerm=${query}`;
  }

  // 6. B&H Photo Video
  if (platform.includes('b&h') || platform.includes('bhphoto')) {
    return `https://www.bhphotovideo.com/c/search?Ntt=${query}&N=0&InitialSearch=yes`;
  }

  // 7. Croma (India)
  if (platform.includes('croma')) {
    return `https://www.croma.com/searchB?q=${query}%3Arelevance`;
  }

  // 8. Reliance Digital (India)
  if (platform.includes('reliance') || platform.includes('reliancedigital')) {
    return `https://www.reliancedigital.in/search?q=${query}:relevance`;
  }

  // 9. Currys (UK)
  if (platform.includes('currys')) {
    return `https://www.currys.co.uk/search?q=${query}`;
  }

  // 10. Argos (UK)
  if (platform.includes('argos')) {
    return `https://www.argos.co.uk/search/${encodeURIComponent(productQuery.replace(/\s+/g, '-'))}/`;
  }

  // 11. John Lewis (UK)
  if (platform.includes('john lewis') || platform.includes('johnlewis')) {
    return `https://www.johnlewis.com/search?search-term=${query}`;
  }

  // 12. JB Hi-Fi (Australia)
  if (platform.includes('jb hi-fi') || platform.includes('jbhifi')) {
    return `https://www.jbhifi.com.au/search?query=${query}`;
  }

  // 13. The Good Guys (Australia)
  if (platform.includes('good guys') || platform.includes('thegoodguys')) {
    return `https://www.thegoodguys.com.au/SearchDisplay?searchTerm=${query}`;
  }

  // 14. MediaMarkt (Germany / Europe)
  if (platform.includes('mediamarkt')) {
    return `https://www.mediamarkt.de/de/search.html?query=${query}`;
  }

  // 15. Otto (Germany)
  if (platform.includes('otto')) {
    return `https://www.otto.de/suche/${query}/`;
  }

  // 16. Saturn (Germany)
  if (platform.includes('saturn')) {
    return `https://www.saturn.de/de/search.html?query=${query}`;
  }

  // 17. Noon (UAE / Middle East)
  if (platform.includes('noon')) {
    return `https://www.noon.com/uae-en/search/?q=${query}`;
  }

  // 18. Sharaf DG (UAE)
  if (platform.includes('sharaf')) {
    return `https://uae.sharafdg.com/?s=${query}&post_type=product`;
  }

  // 19. Newegg
  if (platform.includes('newegg')) {
    return `https://www.newegg.com/p/pl?d=${query}`;
  }

  // 20. Apple Official Store
  if (platform.includes('apple')) {
    return `https://www.apple.com/search/${query}`;
  }

  // 21. Micro Center
  if (platform.includes('micro center') || platform.includes('microcenter')) {
    return `https://www.microcenter.com/search/search_results.aspx?Ntt=${query}`;
  }

  // 22. Generic fallback: If a domain is given, construct a Google site search or direct search
  let cleanDomain = platform.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  if (cleanDomain.includes('.')) {
    return `https://www.google.com/search?q=site%3A${encodeURIComponent(cleanDomain)}+${query}`;
  }

  // Ultimate fallback: direct Google Shopping query for the exact product on that platform
  return `https://www.google.com/search?q=${encodeURIComponent(`${platform} ${productQuery}`)}&tbm=shop`;
}

/**
 * Validates and transforms a storeUrl into a guaranteed deep product page or product search link.
 */
export function resolveProductStoreUrl(
  existingUrl: string | undefined,
  platform: string,
  productName: string,
  countryCode?: string
): string {
  const query = sanitizeProductSearchQuery(productName);

  // If there's an existing URL, check if it's already a specific deep product link (not just a domain)
  if (existingUrl && typeof existingUrl === 'string') {
    const trimmed = existingUrl.trim();
    try {
      const parsed = new URL(trimmed);
      const pathname = parsed.pathname;
      const search = parsed.search;

      // Has query parameters like search query or specific product identifier
      const hasSearchParam =
        search.includes('q=') ||
        search.includes('k=') ||
        search.includes('st=') ||
        search.includes('Ntt=') ||
        search.includes('searchTerm=');

      // Has deep product path (e.g. /dp/B0..., /p/, /product/, /ip/, /item/)
      const hasProductPath =
        pathname.includes('/dp/') ||
        pathname.includes('/gp/product/') ||
        pathname.includes('/p/') ||
        pathname.includes('/product/') ||
        pathname.includes('/search') ||
        pathname.includes('/suche/');

      if (hasSearchParam || hasProductPath) {
        return trimmed;
      }
    } catch {
      // not a valid URL, fallback to builder
    }
  }

  // If it was just a domain like "https://www.amazon.in" or missing deep parameters, build the exact deep search URL
  return buildRetailerProductUrl(platform || existingUrl || 'store', query, countryCode);
}
