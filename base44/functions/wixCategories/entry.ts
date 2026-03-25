import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('wix');

    const response = await fetch('https://www.wixapis.com/categories/v1/categories/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        treeReference: { appNamespace: '@wix/stores' },
        fields: ['BREADCRUMBS_INFO'],
        returnNonVisibleCategories: true,
        query: { cursorPaging: { limit: 100 } },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `Wix API error: ${response.status} - ${err}` }, { status: 500 });
    }

    const data = await response.json();

    const categories = (data.categories || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      visible: cat.visible,
      itemCounter: cat.itemCounter || 0,
      image: cat.image?.url || null,
      parentId: cat.parentCategory?.id || null,
      breadcrumbs: (cat.breadcrumbsInfo?.breadcrumbs || []).map(b => b.categoryName),
    }));

    return Response.json({ categories });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});