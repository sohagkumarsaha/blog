const { DateTime } = require('luxon');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ admin: 'admin' });

  eleventyConfig.addFilter('dateDisplay', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('LLLL d, yyyy');
  });

  eleventyConfig.addFilter('postsJson', (posts) => {
    const data = posts.map((post) => ({
      id: post.fileSlug,
      title: post.data.title,
      url: post.url,
      date: post.date ? post.date.toISOString() : '',
      category: post.data.category || 'uncategorized',
      tags: (post.data.tags || []).filter((tag) => !['posts', 'all'].includes(tag)),
      description: post.data.description || post.data.excerpt || ''
    }));
    return JSON.stringify(data);
  });

  eleventyConfig.addCollection('posts', (collectionApi) => {
    return collectionApi
      .getFilteredByGlob('./src/posts/*.md')
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection('latestPosts', (collectionApi) => {
    return collectionApi
      .getFilteredByGlob('./src/posts/*.md')
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
  });

  eleventyConfig.addCollection('allCategories', (collectionApi) => {
    const categories = new Set();
    collectionApi.getFilteredByGlob('./src/posts/*.md').forEach((post) => {
      if (post.data.category) categories.add(post.data.category);
    });
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  });

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data'
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateFormats: ['md', 'njk', 'html'],
    pathPrefix: '/blog/'
  };
};
