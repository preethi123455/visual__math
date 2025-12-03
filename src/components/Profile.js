import React, { useEffect, useState, useRef } from "react";
import {
  Lightbulb,
  Gamepad2,
  BookOpenText,
  Bot,
  Languages,
  Rocket,
  User,
  UserPlus,
  Wand2,
  Paintbrush2,
  BrainCircuit,
  Video,
  Users2,
  LayoutDashboard,
  BookOpen,
  MessageSquareHeart,
  Star,
  Landmark,
  NotebookPen
} from "lucide-react";

const App = () => {
  const features = [
    { title: "Login", icon: <User size={20} /> },
    { title: "Sign Up", icon: <UserPlus size={20} /> },
    { title: "Voice Input to Math Solution", icon: <Bot size={20} /> },
    { title: "3D Geometric Visualizer", icon: <Rocket size={20} /> },
    { title: "AI Problem Generator", icon: <Wand2 size={20} /> },
    { title: "Multilanguage Support", icon: <Languages size={20} /> },
    { title: "MathRushGame", icon: <Gamepad2 size={20} /> },
    { title: "Gamified Challenges", icon: <Star size={20} /> },
    { title: "Generating Book", icon: <BookOpen size={20} /> },
    { title: "Content Explorer", icon: <LayoutDashboard size={20} /> },
    { title: "Art Generator", icon: <Paintbrush2 size={20} /> },
    { title: "Demo Gaming", icon: <Gamepad2 size={20} /> },
    { title: "Gist Meeting", icon: <Users2 size={20} /> },
    { title: "Math Movie", icon: <Video size={20} /> },
    { title: "Chalkboard", icon: <NotebookPen size={20} /> },
    { title: "Smart Math", icon: <Bot size={20} /> },
    { title: "Road Map", icon: <Landmark size={20} /> },
    { title: "Quiz", icon: <Gamepad2 size={20} /> },
    { title: "Video Content", icon: <Video size={20} /> },
    { title: "AI Assistant", icon: <MessageSquareHeart size={20} /> },
  ];

  const images = [
    "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=2000",
  ];

  const [currentImage, setCurrentImage] = useState(images[0]);
  const cardRefs = useRef([]);
  const [visibleCards, setVisibleCards] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => {
        const currentIndex = images.indexOf(prev);
        const nextIndex = (currentIndex + 1) % images.length;
        return images[nextIndex];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleCards((prev) =>
              prev.includes(index) ? prev : [...prev, index]
            );
          }
        });
      },
      { threshold: 0.3 }
    );
    cardRefs.current.forEach((ref) => ref && observer.observe(ref));
    return () => cardRefs.current.forEach((ref) => ref && observer.unobserve(ref));
  }, []);

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#fefeff" }}>
      {/* HERO */}
      <section
        style={{
          backgroundImage: `url(${currentImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          padding: "120px 20px 60px",
          color: "white",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        ></div>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "700", marginBottom: "20px" }}>
            Visualizing Math: AI for Smarter Learning
          </h1>
          <p style={{ fontSize: "18px", marginBottom: "30px" }}>
            Transform abstract math concepts into interactive visual experiences ✨
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <button
              onClick={() => (window.location.href = "/sidebar")}
              style={{
                background: "linear-gradient(to right, #6a11cb, #2575fc)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              🚀 Explore Now
            </button>
            <button
              onClick={() =>
                (window.location.href =
                  "/invideo-ai-1080%20Revolutionize%20Math%20Learning%20with%20Math%20Vi%202025-04-11.mp4")
              }
              style={{
                background: "linear-gradient(to right, #43cea2, #185a9d)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              🎥 Demo
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "600", marginBottom: "40px" }}>
          💡 Our Awesome Features
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              ref={(el) => (cardRefs.current[idx] = el)}
              data-index={idx}
              style={{
                backgroundColor: "#ffffff",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
                textAlign: "left",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                opacity: visibleCards.includes(idx) ? 1 : 0,
                transform: visibleCards.includes(idx)
                  ? "translateY(0)"
                  : "translateY(40px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
                borderLeft: "6px solid #a29bfe",
              }}
            >
              <div>{feature.icon}</div>
              <div>
                <h4 style={{ margin: 0 }}>{feature.title}</h4>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  Feature description for {feature.title.toLowerCase()}.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default App;
