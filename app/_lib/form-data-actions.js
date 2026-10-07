"use server";

import { getBlogCategories, getProperty } from "./data-services";

export async function getPropertyForInspection(propertyId) {
  return getProperty(propertyId);
}

export async function getBlogCategoriesForForm() {
  return getBlogCategories();
}
