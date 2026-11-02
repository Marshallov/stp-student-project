import { useState } from 'react';
import classroomArt from '../assets/illustrations/classroom.svg';
import ideasArt from '../assets/illustrations/ideas.svg';
import gardenArt from '../assets/illustrations/garden.svg';

const slides = [
  { image: classroomArt, alt: 'Иллюстрация школьного класса', title: 'Всё для своего класса', description: 'Порядок в карточках, доступах и контактах' },
  { image: ideasArt, alt: 'Иллюстрация раскрытой книги и звёзд', title: 'Место для идей', description: 'Учитесь, пробуйте новое и делитесь открытиями' },
  { image: gardenArt, alt: 'Иллюстрация ростка в горшке', title: 'Растём вместе', description: 'Каждый маленький шаг имеет значение' },
];

export function LoginArtCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = slides[activeIndex];
  const showSlide = (index: number) => setActiveIndex((index + slides.length) % slides.length);

  return <div className="login-visual">
    <span className="visual-sticker">МЕСТО, ГДЕ РАСТУТ ИДЕИ <span aria-hidden="true">✳</span></span>
    <button className="illustration-stage" type="button" onClick={() => showSlide(activeIndex + 1)} aria-label="Следующая иллюстрация">
      <img key={slide.image} className="login-illustration" src={slide.image} alt={slide.alt} />
    </button>
    <div className="visual-caption">
      <div className="caption-copy"><span className="caption-index">0{activeIndex + 1} / 0{slides.length}</span><div><strong>{slide.title}</strong><small>{slide.description}</small></div></div>
      <div className="carousel-controls" aria-label="Выбор иллюстрации">
        <button type="button" className="carousel-arrow" onClick={() => showSlide(activeIndex - 1)} aria-label="Предыдущая иллюстрация">←</button>
        <div className="carousel-dots">{slides.map((item, index) => <button
          key={item.image}
          type="button"
          className={`carousel-dot${index === activeIndex ? ' active' : ''}`}
          onClick={() => showSlide(index)}
          aria-label={`Иллюстрация ${index + 1}: ${item.title}`}
          aria-current={index === activeIndex ? 'true' : undefined}
        />)}</div>
        <button type="button" className="carousel-arrow" onClick={() => showSlide(activeIndex + 1)} aria-label="Следующая иллюстрация">→</button>
      </div>
    </div>
  </div>;
}
