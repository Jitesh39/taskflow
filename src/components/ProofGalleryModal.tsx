import React from "react";
import { X } from "lucide-react";

interface ProofGalleryModalProps {
  images: string[];
  onClose: () => void;
}

export default function ProofGalleryModal({ images, onClose }: ProofGalleryModalProps) {
  return (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-transparent border-0">
          <div className="modal-header border-0 justify-content-end p-2">
            <button type="button" className="btn btn-dark rounded-circle p-2" onClick={onClose}>
              <X size={24} className="text-white" />
            </button>
          </div>
          <div className="modal-body p-0 text-center">
            {images.length === 1 ? (
              <img src={images[0]} alt="Proof" className="img-fluid rounded shadow" style={{ maxHeight: "80vh" }} />
            ) : (
              <div className="row g-2 justify-content-center">
                {images.map((src, idx) => (
                  <div key={idx} className="col-6 col-md-4">
                    <img src={src} alt={`Proof ${idx + 1}`} className="img-fluid rounded shadow" style={{ height: "200px", objectFit: "cover", width: "100%" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
