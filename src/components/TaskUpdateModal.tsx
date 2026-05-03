import React, { useState } from "react";
import { X, UploadCloud } from "lucide-react";

interface TaskUpdateModalProps {
  task: any;
  onClose: () => void;
  onSubmit: (taskId: string, formData: FormData) => Promise<void>;
}

export default function TaskUpdateModal({ task, onClose, onSubmit }: TaskUpdateModalProps) {
  const [status, setStatus] = useState(task.status);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "Completed" && images.length === 0) {
      setError("Please upload at least one proof image to mark as Completed.");
      return;
    }
    
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("status", status);
    
    if (status === "Completed") {
      images.forEach(img => {
        formData.append("proofImages", img);
      });
    }

    try {
      await onSubmit(task._id, formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-semibold">Update Task Status</h5>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2 text-sm">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted fw-medium text-sm">Status</label>
                <select className="form-select shadow-none" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {status === "Completed" && (
                <div className="mb-3">
                  <label className="form-label text-muted fw-medium text-sm">Proof of Completion *</label>
                  <div className="border border-dashed rounded p-4 text-center position-relative" style={{ borderColor: '#dee2e6' }}>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="position-absolute top-0 start-0 w-100 h-100 opacity-0" 
                      style={{ cursor: "pointer" }}
                      onChange={handleImageChange}
                    />
                    <UploadCloud size={32} className="text-secondary mb-2" />
                    <p className="m-0 text-muted small">Click or drag images here</p>
                  </div>

                  {previews.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {previews.map((src, idx) => (
                        <div key={idx} className="position-relative" style={{ width: "80px", height: "80px" }}>
                          <img src={src} alt="preview" className="w-100 h-100 object-fit-cover rounded border" />
                          <button 
                            type="button" 
                            className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 p-1 lh-1 translate-middle"
                            onClick={() => removeImage(idx)}
                            style={{ width: "20px", height: "20px" }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-light px-4" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                  {loading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .border-dashed { border-style: dashed !important; }
        .text-sm { font-size: 0.85rem; }
      `}} />
    </div>
  );
}
