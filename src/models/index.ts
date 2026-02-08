import { sequelize } from '@config/database/sql';

// Models
import resumeModel from './resume';

// Initialize models
const Resume = resumeModel(sequelize);
/* =====================================================
   📌 Associations
   ===================================================== */

/* =====================================================
   📌 Export models
   ===================================================== */
export { Resume };
