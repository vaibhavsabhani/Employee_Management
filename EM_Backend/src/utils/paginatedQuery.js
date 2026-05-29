export const paginateQuery = async ({
  model,
  query,
  searchFields = [],
  select = "",
  populate = "",
  defaultSort = { createdAt: -1 },
}) => {
  const pageQuery = Number(query.page) || 1;
  const limit = Math.max(1, Number(query.limit) || 10);

  // support offset-based pagination
  const offsetQuery = query.offset !== undefined ? Number(query.offset) : null;
  const offset = Number.isFinite(offsetQuery) && offsetQuery >= 0 ? offsetQuery : null;

  const skip = offset !== null ? offset : (Math.max(1, pageQuery) - 1) * limit;
  const page = offset !== null ? Math.floor(skip / limit) + 1 : Math.max(1, pageQuery);

  const search = query.search?.trim() || "";
  const status = query.status;
  const sortBy = query.sortBy || Object.keys(defaultSort)[0];
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const filter = {};

  // Search
  if (search && searchFields.length) {
    const regex = new RegExp(search, "i");

    filter.$or = searchFields.map((field) => ({
      [field]: regex,
    }));
  }

  // Active / Inactive
  if (status === "active") {
    filter.isActive = true;
  }

  if (status === "inactive") {
    filter.isActive = false;
  }

  let dataQuery = model
    .find(filter)
    .select(select)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  if (populate) {
    dataQuery = dataQuery.populate(populate);
  }

  const [data, total] = await Promise.all([
    dataQuery,
    model.countDocuments(filter),
  ]);

  return {
    page,
    limit,
    offset: offset !== null ? offset : undefined,
    total,
    totalPages: Math.ceil(total / limit),
    data,
  };
};