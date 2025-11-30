import { Link } from 'react-router-dom';

const FAQButton = () => {
  return (
    <>
      <style>{`
        .faq-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0px 10px 20px rgba(102, 126, 234, 0.4);
          position: fixed;
          bottom: 6rem;
          right: 2rem;
          z-index: 40;
          transition: all 0.3s ease;
        }

        .faq-button:hover {
          transform: translateY(-3px);
          box-shadow: 0px 15px 30px rgba(102, 126, 234, 0.6);
        }

        .faq-button svg {
          height: 1.5em;
          fill: white;
        }

        .faq-button:hover svg {
          animation: jello-vertical 0.7s both;
        }

        @keyframes jello-vertical {
          0% {
            transform: scale3d(1, 1, 1);
          }
          30% {
            transform: scale3d(0.75, 1.25, 1);
          }
          40% {
            transform: scale3d(1.25, 0.75, 1);
          }
          50% {
            transform: scale3d(0.85, 1.15, 1);
          }
          65% {
            transform: scale3d(1.05, 0.95, 1);
          }
          75% {
            transform: scale3d(0.95, 1.05, 1);
          }
          100% {
            transform: scale3d(1, 1, 1);
          }
        }

        .faq-tooltip {
          position: absolute;
          top: -20px;
          opacity: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          pointer-events: none;
          letter-spacing: 0.5px;
          font-weight: 600;
          font-size: 14px;
          white-space: nowrap;
        }

        .faq-tooltip::before {
          position: absolute;
          content: "";
          width: 10px;
          height: 10px;
          background: #764ba2;
          transform: rotate(45deg);
          bottom: -5px;
          transition: all 0.3s ease;
        }

        .faq-button:hover .faq-tooltip {
          top: -50px;
          opacity: 1;
        }

        @media (max-width: 640px) {
          .faq-button {
            width: 45px;
            height: 45px;
            bottom: 5rem;
            right: 1.5rem;
          }

          .faq-button svg {
            height: 1.3em;
          }

          .faq-tooltip {
            font-size: 12px;
            padding: 6px 12px;
          }
        }
      `}</style>

      <Link to="/faq" className="faq-button">
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
        </svg>
        <span className="faq-tooltip">FAQ</span>
      </Link>
    </>
  );
};

export default FAQButton;
