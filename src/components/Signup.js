import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const Signup = () => {
  const webcamRef = useRef(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);

  const captureAndSignup = async () => {
    if (!name || !age || !email) {
      setMessage("❌ All fields are required!");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setMessage("❌ Failed to capture image. Try again!");
      return;
    }

    setCapturedImage(imageSrc);

    try {
      const res = await axios.post("https://visual-math-oscg.onrender.com/signup", {
        name,
        age,
        email,
        image: imageSrc,
      });

      setMessage(res.data.message);

      if (res.data.message.includes("Signup successful")) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setMessage("❌ Signup failed. Try again.");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
      {capturedImage && <img src={capturedImage} alt="Captured face" width={100} />}

      <input type="text" placeholder="Enter Name" onChange={(e) => setName(e.target.value)} required />
      <input type="number" placeholder="Enter Age" onChange={(e) => setAge(e.target.value)} required />
      <input type="email" placeholder="Enter Email" onChange={(e) => setEmail(e.target.value)} required />

      <button onClick={captureAndSignup}>Signup</button>

      <p>{message}</p>
      <button onClick={() => window.location.href = "/login"}>
  Go to Login
</button>
    </div>
  );
};

export default Signup;
