import { DataTypes, Model, Sequelize } from 'sequelize';
import { IResume } from 'types';

export type TResumeModel = Model<IResume, Partial<IResume>> & IResume;

const resumeModel = (sequelize: Sequelize) => {
  const Resume = sequelize.define<TResumeModel>(
    'Resume',
    {
      // =====================================================
      // 🔑 Primary Key
      // =====================================================
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      // =====================================================
      // 👤 BASICS
      // =====================================================
      basics: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
        validate: {
          notNull: { msg: 'Basics is required' },

          isValidBasics(value: any) {
            if (!value || typeof value !== 'object' || Array.isArray(value)) {
              throw new Error('Basics must be a valid object');
            }

            // email validation
            if (value.email) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value.email)) {
                throw new Error('Email must be a valid email address');
              }
            }

            // links validation
            if (value.links && Array.isArray(value.links)) {
              value.links.forEach((l: any, i: number) => {
                if (!l.url) {
                  throw new Error(`basics.links[${i}].url is required`);
                }
                try {
                  new URL(l.url);
                } catch {
                  throw new Error(`basics.links[${i}].url must be valid URL`);
                }
              });
            }
          },
        } as any,
      },

      // =====================================================
      // 🧠 SKILLS
      // =====================================================
      skills: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
        validate: {
          isArray(value: any) {
            if (!Array.isArray(value)) {
              throw new Error('Skills must be an array of strings');
            }
            if (value.some((x: any) => typeof x !== 'string')) {
              throw new Error('Skills must contain only strings');
            }
          },
        } as any,
      },

      // =====================================================
      // 🌍 LANGUAGES
      // =====================================================
      languages: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
        validate: {
          isArray(value: any) {
            if (!Array.isArray(value)) {
              throw new Error('Languages must be an array of strings');
            }
            if (value.some((x: any) => typeof x !== 'string')) {
              throw new Error('Languages must contain only strings');
            }
          },
        } as any,
      },

      // =====================================================
      // 📜 CERTIFICATIONS
      // =====================================================
      certifications: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        validate: {
          isArray(value: any) {
            if (!Array.isArray(value)) {
              throw new Error('Certifications must be an array');
            }

            value.forEach((c: any, i: number) => {
              if (!c || typeof c !== 'object') {
                throw new Error(`certifications[${i}] must be an object`);
              }
              if (!c.name) {
                throw new Error(`certifications[${i}].name is required`);
              }
            });
          },
        } as any,
      },

      // =====================================================
      // ⏱ TOTAL EXPERIENCE
      // =====================================================
      totalExperience: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '0',
      },

      // =====================================================
      // 🎓 EDUCATION
      // =====================================================
      education: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        validate: {
          isArray(value: any) {
            if (!Array.isArray(value)) {
              throw new Error('Education must be an array');
            }
          },
        } as any,
      },

      // =====================================================
      // 💼 EXPERIENCE
      // =====================================================
      experience: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        validate: {
          isArray(value: any) {
            if (!Array.isArray(value)) {
              throw new Error('Experience must be an array');
            }

            value.forEach((e: any, i: number) => {
              if (e.highlights && !Array.isArray(e.highlights)) {
                throw new Error(`experience[${i}].highlights must be an array`);
              }
              if (e.highlights && e.highlights.some((x: any) => typeof x !== 'string')) {
                throw new Error(`experience[${i}].highlights must contain only strings`);
              }
            });
          },
        } as any,
      },

      // =====================================================
      // 🚀 PROJECTS
      // =====================================================
      projects: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        validate: {
          isArray(value: any) {
            if (!Array.isArray(value)) {
              throw new Error('Projects must be an array');
            }

            value.forEach((p: any, i: number) => {
              if (p?.link) {
                try {
                  new URL(p.link);
                } catch {
                  throw new Error(`projects[${i}].link must be a valid URL`);
                }
              }
            });
          },
        } as any,
      },

      // =====================================================
      // 📦 RAW PARSED DATA
      // =====================================================
      raw: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'resumes', // ✅ fixed (was 'profiles')
      timestamps: true,
      indexes: [
        { fields: ['skills'], using: 'GIN' },
        { fields: ['basics'], using: 'GIN' },
      ],
    },
  );

  return Resume;
};

export default resumeModel;
