import {
  MutableRefObject,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
} from 'react';

interface IModalProps {
  show?: boolean;
  closeModal?: () => void;
  children: ReactElement | ReactElement[] | string;
}

const Modal = ({ show = true, children, closeModal }: IModalProps) => {
  const modalRef: MutableRefObject<null | HTMLDivElement> = useRef(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeModal) {
        closeModal();
      }
    },
    [closeModal]
  );

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (!modalRef.current?.contains(event.target as HTMLDivElement)) {
        if (closeModal) closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      <div
        className='modal fade show'
        id='exampleModal'
        aria-labelledby='exampleModalLabel'
        aria-hidden='true'
        style={{ display: show ? 'block' : 'none' }}
      >
        <div className='modal-dialog modal-dialog-centered' ref={modalRef}>
          <div className='modal-content'>{children}</div>
        </div>
      </div>
      <div
        style={{ display: show ? 'block' : 'none' }}
        className='modal-backdrop fade show'
      ></div>
    </>
  );
};

export default Modal;
