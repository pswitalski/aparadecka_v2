import { defineQuery } from 'groq';

export const featuredPaintingsQuery = defineQuery(`*[_type == "home"][0]{
  "featuredPaintings": (featured[]->{
    _id,
    title,
    medium,
    support,
    dimensions,
    mainImage,
    "year": *[_type == "collection" && references(^._id)][0].year
  })[defined(year)]
}`);

export const collectionsQuery = defineQuery(`*[_type == "collection"] | order(year desc){
  year,
  "thumbnail": thumbnail->{ _id, title, medium, support, dimensions, mainImage }
}`);

export const collectionByYearQuery = defineQuery(`*[_type == "collection" && year == $year][0]{
  year,
  "paintings": paintings[]->{ _id, title, medium, support, dimensions, mainImage }
}`);

export const aboutQuery = defineQuery(`*[_type == "about"][0]{
  "sections": sections[]{
    _key,
    _type,
    text,
    highlighted,
    imagePositionDesktop,
    imagePositionMobile,
    textAlign,
    image{
      "asset": asset,
      alt,
      title
    }
  }
}`);

export const contactQuery = defineQuery(`*[_type == "contact"][0]{
  email,
  instagram,
  facebook
}`);

export const siteQuery = defineQuery(`*[_type == "site"][0]{
  siteTitle,
  description,
  keywords
}`);
