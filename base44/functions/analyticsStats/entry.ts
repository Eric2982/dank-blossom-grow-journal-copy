import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_analytics');
    const propertyId = Deno.env.get('GA4_PROPERTY_ID');

    const body = {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
            { name: 'activeUsers' },
            { name: 'newUsers' },
            { name: 'sessions' },
            { name: 'eventCount' },
        ],
        dimensions: [{ name: 'date' }],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
        limit: 30,
    };

    const res = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        return Response.json({ error: data.error?.message || 'GA4 error' }, { status: res.status });
    }

    // Parse into a simple array
    const rows = (data.rows || []).map((row) => ({
        date: row.dimensionValues[0].value,
        activeUsers: parseInt(row.metricValues[0].value, 10),
        newUsers: parseInt(row.metricValues[1].value, 10),
        sessions: parseInt(row.metricValues[2].value, 10),
        events: parseInt(row.metricValues[3].value, 10),
    }));

    return Response.json({ rows });
});