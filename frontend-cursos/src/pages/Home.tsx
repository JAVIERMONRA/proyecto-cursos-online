import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle,
  Play,
  Star
} from "lucide-react";
import "./Home.css";

const Home: React.FC = () => {
  const features = [
    {
      icon: <BookOpen size={32} />,
      title: "Contenido de Calidad",
      description: "Accede a cursos creados por expertos en diferentes áreas del conocimiento."
    },
    {
      icon: <Award size={32} />,
      title: "Certificados Verificables",
      description: "Obtén certificados al completar tus cursos y mejora tu perfil profesional."
    },
    {
      icon: <Clock size={32} />,
      title: "Aprende a tu Ritmo",
      description: "Estudia cuando quieras, donde quieras, sin horarios fijos ni presiones."
    }
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Estudiante de Desarrollo Web",
      text: "Los cursos son excelentes y el contenido está muy bien estructurado. He aprendido mucho en poco tiempo.",
      rating: 5
    },
    {
      name: "Carlos Rodríguez",
      role: "Profesional en Marketing",
      text: "La plataforma es intuitiva y los instructores realmente saben de lo que hablan. Totalmente recomendado.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Diseñadora UX/UI",
      text: "Me encanta poder aprender a mi ritmo. Los certificados han sido valiosos para mi carrera profesional.",
      rating: 5
    }
  ];

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Transforma tu futuro con
            <span className="gradient-text"> aprendizaje online</span>
          </h1>
          
          <p className="hero-subtitle">
            Accede a cursos de alta calidad, aprende nuevas habilidades y alcanza tus metas profesionales. 
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-hero btn-primary">
              Comenzar Gratis
              <Play size={20} />
            </Link>
            <Link to="/login" className="btn-hero btn-secondary">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">¿Por qué elegir CursosOnline?</h2>
          <p className="section-subtitle">
            Te ofrecemos las mejores herramientas para tu crecimiento profesional
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-content">
          <div className="benefits-text">
            <h2 className="section-title">
              Aprende de forma <span className="gradient-text">inteligente</span>
            </h2>
            <p className="section-description">
              Nuestra plataforma está diseñada para ofrecerte la mejor experiencia de aprendizaje 
              con herramientas modernas y contenido actualizado constantemente.
            </p>

            <div className="benefits-list">
              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-check" />
                <div>
                  <h4>Acceso ilimitado</h4>
                  <p>Una vez inscrito, accede al contenido cuando quieras</p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-check" />
                <div>
                  <h4>Actualizaciones constantes</h4>
                  <p>El contenido se actualiza regularmente con las últimas tendencias</p>
                </div>
              </div>

              <div className="benefit-item">
                <CheckCircle size={24} className="benefit-check" />
                <div>
                  <h4>Certificación profesional</h4>
                  <p>Obtén certificados reconocidos al completar tus cursos</p>
                </div>
              </div>
            </div>

            <Link to="/register" className="btn-cta">
              Comenzar ahora
              <Play size={18} />
            </Link>
          </div>

          <div className="benefits-visual">
            <div className="visual-placeholder">
              <BookOpen size={120} className="visual-icon" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">Lo que dicen nuestros estudiantes</h2>
          <p className="section-subtitle">
            Miles de personas han transformado sus carreras con nosotros
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">¿Listo para comenzar tu viaje de aprendizaje?</h2>
          <p className="cta-subtitle">
            Únete a miles de estudiantes que ya están mejorando sus habilidades
          </p>
          <div className="cta-actions">
            <Link to="/register" className="btn-cta-primary">
              Crear cuenta gratis
            </Link>
            <Link to="/login" className="btn-cta-secondary">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">
              <BookOpen size={24} />
              CursosOnline
            </h3>
            <p className="footer-description">
              Transformando vidas a través de la educación online de calidad.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CursosOnline. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;