import React from 'react';
import axios from 'axios';

const AddApplication = ({ onClose, onApply, exam, user }) => {

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://onlineexam-rcrg.onrender.com/api/exams/add-applications', {
        user: user._id,
        exam: exam._id,
      });
      onApply(); // Refresh the applications list
      onClose(); // Close the form after successful submission
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };
  
  return (
    <>
      <div className="overlay" onClick={onClose}></div>
      <form className="add-application-form text-dark" onSubmit={handleSubmit}>
        <h3 className="text-center">Apply for {exam.title}</h3>
        <div className="mb-3">
          <label htmlFor="userDetails" className="form-label">
            User Details
          </label>
          <input
            type="text"
            className="form-control"
            id="userDetails"
            value={`${user.name} - ${user.email}`}
            disabled
          />
        </div>
        <div className="mb-3">
          <label htmlFor="userDetails" className="form-label">
          Exam Details
          </label>
          <input
            type="text"
            className="form-control"
            id="userDetails"
            value={`${exam.title} - ${exam.description}`}
            disabled
          />
        </div>
    <div className='d-flex justify-content-between align-items-center'>
<div> 

        <button type="submit" className="btn btn-primary mx-3">
          Apply
        </button>
</div>
<div className="d-flex gap-3 justify-content-around align-items-center"> 


        <h6>Application End - {new Date(exam.applicationEndDate).toDateString()}</h6>

</div>
    </div>
      </form>
    </>
  );
};

export default AddApplication;
