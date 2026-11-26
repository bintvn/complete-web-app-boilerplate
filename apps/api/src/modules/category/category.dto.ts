import type { CategoryEntity } from './entities/category.entity.js';

const categoryDto = (category: CategoryEntity) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  posts: category.categoryPosts
    ? category.categoryPosts.map((categoryPost) => categoryPost.post)
    : [],
});

export default categoryDto;
