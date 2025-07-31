// Firestore job status logic for Applied tab
// Usage: window.updateJobStatus(...), window.fetchJobStatuses(...), etc.

const db = firebase.firestore();

window.updateJobStatus = async function(userId, jobId, newStatus) {
  await db.doc(`users/${userId}/appliedJobs/${jobId}`).set({ status: newStatus }, { merge: true });
};

window.fetchJobStatuses = async function(userId) {
  const querySnapshot = await db.collection(`users/${userId}/appliedJobs`).get();
  let statuses = {};
  querySnapshot.forEach((doc) => {
    statuses[doc.id] = doc.data().status;
  });
  return statuses;
};

window.updateJob = async function(userId, jobId, jobObj) {
  await db.doc(`users/${userId}/appliedJobs/${jobId}`).set(jobObj, { merge: true });
};

window.fetchJobs = async function(userId) {
  const querySnapshot = await db.collection(`users/${userId}/appliedJobs`).get();
  let jobs = {};
  querySnapshot.forEach((doc) => {
    jobs[doc.id] = doc.data();
  });
  console.log('Jobs fetched from Firestore:', jobs);
  return jobs;
};

window.clearAllJobs = async function(userId) {
  const querySnapshot = await db.collection(`users/${userId}/appliedJobs`).get();
  const batch = db.batch();
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log('All jobs cleared for user:', userId);
  return true;
};
