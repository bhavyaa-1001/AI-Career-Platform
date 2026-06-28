import { Company } from '../models/Company.js';
import { ApiError } from '../utils/ApiError.js';

import { logActivity } from './activityService.js';

export const getOrCreateCompany = async (recruiterId) => {
  let company = await Company.findOne({ recruiterId });
  if (!company) {
    company = await Company.create({
      recruiterId,
      name: 'My Company',
      description: '',
    });
  }
  return company.toSafeObject();
};

export const getCompanyByRecruiter = async (recruiterId) => {
  const company = await Company.findOne({ recruiterId });
  if (!company) throw new ApiError(404, 'Company profile not found. Create one first.');
  return company.toSafeObject();
};

export const upsertCompany = async (recruiterId, data) => {
  let company = await Company.findOne({ recruiterId });
  const isNew = !company;

  if (!company) {
    company = new Company({ recruiterId, ...data });
  } else {
    Object.assign(company, data);
  }

  await company.save();

  await logActivity(
    recruiterId,
    isNew ? 'company_created' : 'company_updated',
    isNew ? `Created company profile: ${company.name}` : `Updated company profile: ${company.name}`,
    { companyId: company._id.toString() },
  );

  return company.toSafeObject();
};

export const updateCompany = async (recruiterId, data) => {
  const company = await Company.findOne({ recruiterId });
  if (!company) throw new ApiError(404, 'Company profile not found');

  Object.assign(company, data);
  await company.save();

  await logActivity(recruiterId, 'company_updated', `Updated company profile: ${company.name}`, {
    companyId: company._id.toString(),
  });

  return company.toSafeObject();
};

export const getCompanyCompletion = (company) => {
  const fields = ['name', 'description', 'website', 'industry', 'location', 'size'];
  const filled = fields.filter((f) => {
    const val = company[f];
    return val && String(val).trim().length > 0 && val !== 'My Company';
  }).length;
  return Math.round((filled / fields.length) * 100);
};
