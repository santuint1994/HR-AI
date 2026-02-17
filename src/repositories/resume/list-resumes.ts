import { Resume, ResumeBasics } from '@models/index';

export const listResumes = async () => {
  const rows = await Resume.findAll({
    include: [{ model: ResumeBasics, as: 'basics' }],
    order: [['createdAt', 'DESC']],
  });

  return rows.map((r: any) => ({
    id: r.id,
    fullName: r.basics?.fullName ?? null,
    headline: r.basics?.headline ?? null,
    email: r.basics?.email ?? null,
    phone: r.basics?.phone ?? null,
    totalExperience: r.totalExperience ?? 0,
    createdAt: r.createdAt,
  }));
};

