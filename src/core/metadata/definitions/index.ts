import type { EntityMetadata } from '../interfaces/metadata.js';
import { branchMetadata } from './branch.metadata.js';
import { classMetadata } from './class.metadata.js';
import { parentMetadata } from './parent.metadata.js';
import { schoolMetadata } from './school.metadata.js';
import { sectionMetadata } from './section.metadata.js';
import { staffMetadata } from './staff.metadata.js';
import { studentMetadata } from './student.metadata.js';
import { subjectMetadata } from './subject.metadata.js';

export const initialEntityMetadata: EntityMetadata[] = [
  schoolMetadata,
  branchMetadata,
  classMetadata,
  sectionMetadata,
  subjectMetadata,
  parentMetadata,
  staffMetadata,
  studentMetadata,
];
