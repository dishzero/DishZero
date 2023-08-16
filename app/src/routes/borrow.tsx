import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Scanner from "../widgets/scanner";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const Confirm = ({ show, onSubmit, onCancel, id }) => {
  return (
    <Modal
      onHide={onCancel}
      show={show}
      className="modal-dialog-centered modal-sm"
      centered
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body className="text-center">
        <p style={{ textAlign: "center" }}>ID : {id}</p>
        <FontAwesomeIcon icon={faCoffee} size="4x" />
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button variant="secondary" onClick={onSubmit}>
          Borrow
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default () => {
  const {currentUser, sessionToken} = useAuth()
  const [scanId, setScanId] = useState("");
  const [confirm, setConfirm] = useState(false);

  const navigate = useNavigate();
  const [Buffer, setBuffer] = useState(false);
  const onScan = confirm
    ? null
    : (id: string) => {
        setScanId(id);
        setConfirm(true);
      };

  const onConfirm = async () => {
    if (!confirm) {
      return false;
    }
    setConfirm(false);
    const user = currentUser?.id || null;
    console.log("USER: " + user);
    console.log("scanid", scanId);

    axios
      .post(
        `${process.env.REACT_APP_BACKEND_ADDRESS}/api/dish/borrow`,{},
        {
          headers: { "x-api-key": `${process.env.REACT_APP_API_KEY}`, "session-token": sessionToken },
          params: { qid: scanId },
        }
      )
      .then(function (response) {
        navigate("/home")
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const onCancel = confirm
    ? () => {
        setScanId("");
        setConfirm(false);
      }
    : null;

  return (
    <>
      <Scanner
        mode="Scan Dishes"
        onScan={onScan}
        onClose={() => navigate("/home")}
      />
      <Confirm
        show={confirm}
        id={scanId}
        onSubmit={async () => {
          await onConfirm();
        }}
        onCancel={onCancel}
      />
    </>
  );
};
