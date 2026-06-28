import { CodingProblem } from '../models/CodingProblem.js';
import { ProblemBookmark } from '../models/ProblemBookmark.js';

export const toggleBookmark = async (userId, problemId) => {
  let bookmark = await ProblemBookmark.findOne({ userId, problemId });
  if (!bookmark) {
    bookmark = await ProblemBookmark.create({ userId, problemId, isBookmarked: true });
  } else {
    bookmark.isBookmarked = !bookmark.isBookmarked;
    await bookmark.save();
  }
  return bookmark.toSafeObject();
};

export const toggleFavorite = async (userId, problemId) => {
  let bookmark = await ProblemBookmark.findOne({ userId, problemId });
  if (!bookmark) {
    bookmark = await ProblemBookmark.create({ userId, problemId, isFavorite: true });
  } else {
    bookmark.isFavorite = !bookmark.isFavorite;
    await bookmark.save();
  }
  return bookmark.toSafeObject();
};

export const listBookmarks = async (userId, { type = 'bookmarked', page = 1, limit = 20 } = {}) => {
  const filter = { userId };
  if (type === 'bookmarked') filter.isBookmarked = true;
  else if (type === 'favorite') filter.isFavorite = true;
  else if (type === 'solved') filter.status = 'solved';
  else if (type === 'recent') filter.lastAttemptedAt = { $ne: null };

  const skip = (page - 1) * limit;
  const sort = type === 'recent' ? { lastAttemptedAt: -1 } : { updatedAt: -1 };

  const [items, total] = await Promise.all([
    ProblemBookmark.find(filter).sort(sort).skip(skip).limit(limit),
    ProblemBookmark.countDocuments(filter),
  ]);

  const problemIds = items.map((b) => b.problemId);
  const problems = await CodingProblem.find({ _id: { $in: problemIds } });
  const problemMap = Object.fromEntries(problems.map((p) => [p._id.toString(), p.toSafeObject()]));

  return {
    bookmarks: items.map((b) => ({
      ...b.toSafeObject(),
      problem: problemMap[b.problemId.toString()] || null,
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const getProblemUserState = async (userId, problemId) => {
  const bookmark = await ProblemBookmark.findOne({ userId, problemId });
  return bookmark?.toSafeObject() || {
    isBookmarked: false, isFavorite: false, status: 'none',
  };
};

export const getBookmarkStats = async (userId) => {
  const [bookmarked, favorites, solved, recent] = await Promise.all([
    ProblemBookmark.countDocuments({ userId, isBookmarked: true }),
    ProblemBookmark.countDocuments({ userId, isFavorite: true }),
    ProblemBookmark.countDocuments({ userId, status: 'solved' }),
    ProblemBookmark.find({ userId, lastAttemptedAt: { $ne: null } })
      .sort({ lastAttemptedAt: -1 }).limit(5)
      .populate('problemId', 'title slug difficulty'),
  ]);

  return {
    bookmarked,
    favorites,
    solved,
    recent: recent.map((b) => ({
      ...b.toSafeObject(),
      problem: b.problemId ? {
        id: b.problemId._id.toString(),
        title: b.problemId.title,
        slug: b.problemId.slug,
        difficulty: b.problemId.difficulty,
      } : null,
    })),
  };
};
