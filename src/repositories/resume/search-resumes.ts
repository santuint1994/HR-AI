import { Resume, ResumeBasics, ResumeSkill } from '@models/index';
import { Op } from 'sequelize';
import { IResume } from 'types';

export const searchResumes = async (term: string, page = 1, limit = 10) => {
  const like = `%${term}%`;
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 10;
  const offset = (safePage - 1) * safeLimit;

  // Step 1: Find matching Resume IDs (no limit/offset here, so $nested.col$ works correctly)
  const matchingIds = await Resume.findAll({
    subQuery: false,
    include: [
      {
        model: ResumeBasics,
        as: 'basics',
        required: false,
        attributes: [],
      },
      {
        model: ResumeSkill,
        as: 'skills',
        required: false,
        attributes: [],
      },
    ],
    where: {
      [Op.or]: [
        { '$basics.fullName$': { [Op.iLike]: like } },
        { '$basics.email$': { [Op.iLike]: like } },
        { '$basics.phone$': { [Op.iLike]: like } },
        { '$skills.name$': { [Op.iLike]: like } },
      ],
    },
    attributes: ['id'],
    group: ['Resume.id'], // collapse duplicates from the JOIN
    raw: true,
  });

  const ids = matchingIds.map((r) => (r as any).id);
  const totalItems = ids.length;

  if (totalItems === 0) {
    return {
      resumes: [],
      pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: Number(safePage),
        pageSize: safeLimit,
      },
    };
  }

  // Step 2: Fetch paginated results by ID, safely with includes
  const rows = await Resume.findAll({
    where: { id: { [Op.in]: ids } },
    include: [
      {
        model: ResumeBasics,
        as: 'basics',
        required: false,
        attributes: ['fullName', 'email', 'phone'],
      },
      {
        model: ResumeSkill,
        as: 'skills',
        required: false,
        attributes: ['name'],
      },
    ],
    attributes: ['id', 'createdAt', 'totalExperience'],
    order: [['createdAt', 'DESC']],
    limit: safeLimit,
    offset,
  });

  return {
    resumes: rows.map((r) => r.get({ plain: true })) as IResume[],
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / safeLimit),
      currentPage: Number(safePage),
      pageSize: safeLimit,
    },
  };
};