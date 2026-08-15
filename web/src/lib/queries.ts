import { defineQuery } from 'groq';

const paintingProjection = `_id, title, year, medium, support, dimensions, mainImage`;

export const featuredPaintingsQuery = defineQuery(`*[_type == "home"][0]{
  "featured": featured[]->{ ${paintingProjection} }
}`);

export const collectionsQuery = defineQuery(`*[_type == "collection"] | order(year desc){
  year,
  "thumbnail": thumbnail->{ ${paintingProjection} }
}`);

export const collectionByYearQuery = defineQuery(`*[_type == "collection" && year == $year][0]{
  year,
  "paintings": paintings[]->{ ${paintingProjection} }
}`);

export const aboutQuery = defineQuery(`*[_type == "about"][0]{
  body
}`);

export const contactQuery = defineQuery(`*[_type == "contact"][0]{
  email,
  instagram,
  facebook
}`);

export const siteQuery = defineQuery(`*[_type == "site"][0]{
  title,
  description,
  keywords
}`);
