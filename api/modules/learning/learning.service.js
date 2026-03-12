import { v4 as uuidv4 } from 'uuid';
import { Course, LearningTrack, Module, Lesson, LessonContent } from '../../db/models/index.js';
import { AppError } from '../../core/errors/AppError.js';

export async function listTracks(tenantId) {
  return LearningTrack.findAll({ where: { tenantId }, order: [['createdAt', 'DESC']] });
}
export async function createTrack(tenantId, userId, payload) {
  return LearningTrack.create({ id: uuidv4(), tenantId, title: payload.title, slug: payload.slug || payload.title.toLowerCase().replaceAll(' ', '-'), description: payload.description || null, status: payload.status || 'draft', visibility: payload.visibility || 'private', estimatedMinutes: payload.estimatedMinutes || null, createdBy: userId });
}
export async function getTrackDetails(tenantId, trackId) {
  const track = await LearningTrack.findOne({ where: { id: trackId, tenantId }, include: [{ model: Course, as: 'courses', include: [{ model: Module, as: 'modules', include: [{ model: Lesson, as: 'lessons', include: [{ model: LessonContent, as: 'contents' }] }] }] }] });
  if (!track) throw new AppError('Trilha não encontrada', 404);
  return track;
}
