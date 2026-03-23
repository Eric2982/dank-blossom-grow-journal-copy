import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_search_console');

    const body = await req.json().catch(() => ({}));
    const siteUrl = body.siteUrl || 'https://dankblossom.app';
    const sitemapUrl = body.sitemapUrl || `${siteUrl}/sitemap.xml`;

    // Submit the sitemap to Google Search Console
    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: `Google API error: ${response.status}`, details: errorText }, { status: response.status });
    }

    // Also fetch sitemap status to confirm
    const statusRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    const statusData = statusRes.ok ? await statusRes.json() : null;

    return Response.json({
      success: true,
      message: `Sitemap submitted successfully: ${sitemapUrl}`,
      status: statusData,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});