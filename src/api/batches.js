// BatchesApi: Modular API for batch management endpoints
import { get, post, put, del } from './utils';

export const BatchesApi = {
  getBatches: () => get('/batches/get-all.php'),
  createBatch: (batchData) => post('/batches/create.php', batchData),
  updateBatch: (id, batchData) => put(`/batches/update.php?id=${id}`, batchData),
  deleteBatch: (id) => del(`/batches/delete.php?id=${id}`),
  getBatchDetails: (id) => get(`/batches/get-details.php?id=${id}`),
  getBatchStudents: (id) => get(`/batches/get-students.php?id=${id}`),
  addStudentToBatch: (batchId, studentId) => post('/batches/add-student.php', { batch_id: batchId, student_id: studentId }),
  removeStudentFromBatch: (batchId, studentId) => post('/batches/remove-student.php', { batch_id: batchId, student_id: studentId }),
  getBatchClassroomId: (batchId) => get(`/batches/get-classroom-id.php?batch_id=${batchId}`),
};
