import { Resume, ResumeBasics, ResumeSkill } from '@models/index';
import { Op } from 'sequelize';
import { IResume } from 'types';

export const searchResumes = async (term: string, page = 1, limit = 10) => {
  const like = `%${term}%`;

  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 10;
  const offset = (safePage - 1) * safeLimit;

  const rows = await Resume.findAndCountAll({
    subQuery: false,
    include: [
      {
        model: ResumeBasics,
        as: 'basics',
        required: false,
        attributes: ['fullName', 'email', 'phone'], // only needed fields
      },
      {
        model: ResumeSkill,
        as: 'skills',
        required: false,
        attributes: ['name'], // only needed fields
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
    distinct: true,
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'createdAt','totalExperience'], // only Resume's own columns
    limit: safeLimit,
    offset,
  });

  return {
    resumes: rows.rows.map((r) => r.get({ plain: true })) as IResume[],
    pagination: {
      totalItems: rows.count,
      totalPages: Math.ceil(rows.count / safeLimit),
      currentPage: Number(safePage),
      pageSize: safeLimit,
    },
  };
};