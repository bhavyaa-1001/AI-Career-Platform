import { DEFAULT_STARTER_CODE, slugify } from '../config/codingConstants.js';
import { CodingProblem } from '../models/CodingProblem.js';
import { ApiError } from '../utils/ApiError.js';

const buildFilter = ({ difficulty, category, tag, search, status = 'published' }) => {
  const filter = {};
  if (status) filter.status = status;
  if (difficulty) filter.difficulty = difficulty;
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }
  return filter;
};

export const listProblems = async ({
  page = 1, limit = 20, difficulty, category, tag, search, status = 'published',
} = {}) => {
  const resolvedStatus = status === 'all' ? undefined : status;
  const filter = buildFilter({ difficulty, category, tag, search, status: resolvedStatus });
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    CodingProblem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    CodingProblem.countDocuments(filter),
  ]);

  return {
    problems: items.map((p) => {
      const safe = p.toSafeObject();
      delete safe.hiddenTestCases;
      delete safe.editorial;
      return safe;
    }),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const getProblemBySlug = async (slug, { admin = false } = {}) => {
  const problem = await CodingProblem.findOne({ slug: slug.toLowerCase() });
  if (!problem) throw new ApiError(404, 'Problem not found');
  if (!admin && problem.status !== 'published') throw new ApiError(404, 'Problem not found');
  return problem.toSafeObject({ includeHidden: admin });
};

export const getProblemById = async (id, { admin = false } = {}) => {
  const problem = await CodingProblem.findById(id);
  if (!problem) throw new ApiError(404, 'Problem not found');
  return problem.toSafeObject({ includeHidden: admin });
};

export const createProblem = async (userId, data) => {
  const slug = data.slug || slugify(data.title);
  const existing = await CodingProblem.findOne({ slug });
  if (existing) throw new ApiError(409, 'Slug already exists');

  const starterCode = data.starterCode || DEFAULT_STARTER_CODE;

  const doc = await CodingProblem.create({
    ...data,
    slug,
    starterCode,
    createdBy: userId,
  });

  return doc.toSafeObject({ includeHidden: true });
};

export const updateProblem = async (id, data) => {
  const problem = await CodingProblem.findById(id);
  if (!problem) throw new ApiError(404, 'Problem not found');

  if (data.slug && data.slug !== problem.slug) {
    const existing = await CodingProblem.findOne({ slug: data.slug });
    if (existing) throw new ApiError(409, 'Slug already exists');
  }

  Object.assign(problem, data);
  await problem.save();
  return problem.toSafeObject({ includeHidden: true });
};

export const deleteProblem = async (id) => {
  const problem = await CodingProblem.findById(id);
  if (!problem) throw new ApiError(404, 'Problem not found');
  await problem.deleteOne();
};

export const updateProblemStats = async (problemId, { accepted }) => {
  const problem = await CodingProblem.findById(problemId);
  if (!problem) return;

  problem.totalSubmissions += 1;
  if (accepted) problem.totalAccepted += 1;
  problem.acceptanceRate = problem.totalSubmissions
    ? Math.round((problem.totalAccepted / problem.totalSubmissions) * 100)
    : 0;
  await problem.save();
};

export const getProblemDocument = async (id) => {
  const problem = await CodingProblem.findById(id);
  if (!problem) throw new ApiError(404, 'Problem not found');
  return problem;
};

export const getProblemDocumentBySlug = async (slug) => {
  const problem = await CodingProblem.findOne({ slug: slug.toLowerCase(), status: 'published' });
  if (!problem) throw new ApiError(404, 'Problem not found');
  return problem;
};
