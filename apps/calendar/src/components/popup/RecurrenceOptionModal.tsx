import { h } from 'preact';
import { useState } from 'preact/hooks';
import { cls } from '@src/helpers/css';

export type RecurrenceActionOption = 'this' | 'thisAndFuture' | 'all';

interface Props {
  isOpen: boolean;
  isRecurring: boolean;
  actionType: 'edit' | 'delete';
  onConfirm: (option: RecurrenceActionOption) => void;
  onCancel: () => void;
}

const classNames = {
  overlay: cls('recurrence-option-overlay'),
  modal: cls('recurrence-option-modal'),
  title: cls('recurrence-option-title'),
  message: cls('recurrence-option-message'),
  optionsContainer: cls('recurrence-option-options'),
  optionButton: cls('recurrence-option-button'),
  optionTitle: cls('recurrence-option-button-title'),
  optionDescription: cls('recurrence-option-button-description'),
  buttonGroup: cls('recurrence-option-button-group'),
  button: cls('recurrence-option-button-action'),
  buttonPrimary: cls('recurrence-option-button-primary'),
  buttonSecondary: cls('recurrence-option-button-secondary'),
};

export function RecurrenceOptionModal({
  isOpen,
  isRecurring,
  actionType,
  onConfirm,
  onCancel,
}: Props) {
  const [selectedOption, setSelectedOption] = useState<RecurrenceActionOption>('this');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingOption, setPendingOption] = useState<RecurrenceActionOption | null>(null);

  if (!isOpen) {
    return null;
  }

  const actionLabel = actionType === 'edit' ? '수정' : '삭제';
  const actionColor = actionType === 'edit' ? '#06c9fa' : '#dc3545';

  const handleOptionClick = (option: RecurrenceActionOption) => {
    setSelectedOption(option);
    // 선택 피드백을 위해 약간의 지연 후 확인 모달 표시
    setTimeout(() => {
      setPendingOption(option);
      setShowConfirmModal(true);
    }, 150);
  };

  const handleConfirm = () => {
    if (pendingOption) {
      onConfirm(pendingOption);
      setShowConfirmModal(false);
      setPendingOption(null);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setPendingOption(null);
  };

  return (
    <div className={classNames.overlay} onClick={onCancel}>
      <div className={classNames.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={classNames.title} style={{ color: actionColor }}>
          일정 {actionLabel}
        </h3>
        <p className={classNames.message}>
          반복 일정을 {isRecurring ? '어떻게' : ''} {actionLabel}하시겠습니까?
        </p>

        {isRecurring && !showConfirmModal && (
          <div className={classNames.optionsContainer}>
            <button
              type="button"
              className={`${classNames.optionButton} ${selectedOption === 'this' ? 'selected' : ''}`}
              onClick={() => handleOptionClick('this')}
              style={selectedOption === 'this' ? { 
                borderColor: actionColor,
                borderWidth: '2px',
                background: actionType === 'edit' ? 'rgba(6, 201, 250, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                boxShadow: `0 0 0 3px ${actionType === 'edit' ? 'rgba(6, 201, 250, 0.1)' : 'rgba(220, 53, 69, 0.1)'}`,
                transform: 'translateY(-1px)'
              } : {}}
            >
              {selectedOption === 'this' && (
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: actionColor,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  lineHeight: '20px'
                }}>✓</span>
              )}
              <div className={classNames.optionTitle} style={selectedOption === 'this' ? { color: actionColor, fontWeight: '700', paddingLeft: '32px' } : {}}>
                이 일정만 {actionLabel}
              </div>
              <div className={classNames.optionDescription} style={selectedOption === 'this' ? { color: actionColor, paddingLeft: '32px' } : {}}>
                선택한 날짜의 일정만 {actionLabel}됩니다.
              </div>
            </button>
            {/* 수정 시에는 thisAndFuture 옵션 제거 */}
            {actionType === 'delete' && (
              <button
                type="button"
                className={`${classNames.optionButton} ${selectedOption === 'thisAndFuture' ? 'selected' : ''}`}
                onClick={() => handleOptionClick('thisAndFuture')}
                style={selectedOption === 'thisAndFuture' ? { 
                  borderColor: actionColor,
                  borderWidth: '2px',
                  background: 'rgba(220, 53, 69, 0.1)',
                  boxShadow: `0 0 0 3px rgba(220, 53, 69, 0.1)`,
                  transform: 'translateY(-1px)'
                } : {}}
              >
                {selectedOption === 'thisAndFuture' && (
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: actionColor,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    lineHeight: '20px'
                  }}>✓</span>
                )}
                <div className={classNames.optionTitle} style={selectedOption === 'thisAndFuture' ? { color: actionColor, fontWeight: '700', paddingLeft: '32px' } : {}}>
                  이 일정과 이후 모든 일정 {actionLabel}
                </div>
                <div className={classNames.optionDescription} style={selectedOption === 'thisAndFuture' ? { color: actionColor, paddingLeft: '32px' } : {}}>
                  선택한 날짜부터 모든 반복 일정이 {actionLabel}됩니다.
                </div>
              </button>
            )}
            <button
              type="button"
              className={`${classNames.optionButton} ${selectedOption === 'all' ? 'selected' : ''}`}
              onClick={() => handleOptionClick('all')}
              style={selectedOption === 'all' ? { 
                borderColor: actionColor,
                borderWidth: '2px',
                background: actionType === 'edit' ? 'rgba(6, 201, 250, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                boxShadow: `0 0 0 3px ${actionType === 'edit' ? 'rgba(6, 201, 250, 0.1)' : 'rgba(220, 53, 69, 0.1)'}`,
                transform: 'translateY(-1px)'
              } : {}}
            >
              {selectedOption === 'all' && (
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: actionColor,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  lineHeight: '20px'
                }}>✓</span>
              )}
              <div className={classNames.optionTitle} style={selectedOption === 'all' ? { color: actionColor, fontWeight: '700', paddingLeft: '32px' } : {}}>
                연관된 모든 일정 {actionLabel}
              </div>
              <div className={classNames.optionDescription} style={selectedOption === 'all' ? { color: actionColor, paddingLeft: '32px' } : {}}>
                이 반복 일정의 모든 항목이 {actionLabel}됩니다.
              </div>
            </button>
          </div>
        )}

        {showConfirmModal && (
          <div className={classNames.message} style={{ marginBottom: '20px' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
              {pendingOption === 'this' && `이 일정만 ${actionLabel}하시겠습니까?`}
              {pendingOption === 'thisAndFuture' && `이 일정과 이후 모든 일정을 ${actionLabel}하시겠습니까?`}
              {pendingOption === 'all' && `연관된 모든 일정을 ${actionLabel}하시겠습니까?`}
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              {pendingOption === 'this' && '선택한 날짜의 일정만 처리됩니다.'}
              {pendingOption === 'thisAndFuture' && '선택한 날짜부터 모든 반복 일정이 처리됩니다.'}
              {pendingOption === 'all' && '이 반복 일정의 모든 항목이 처리됩니다.'}
            </p>
          </div>
        )}

        <div className={classNames.buttonGroup}>
          {!isRecurring && !showConfirmModal && (
            <button
              type="button"
              className={`${classNames.button} ${classNames.buttonPrimary}`}
              style={{ backgroundColor: actionColor }}
              onClick={handleConfirm}
            >
              {actionLabel}
            </button>
          )}
          {isRecurring && showConfirmModal && (
            <>
              <button
                type="button"
                className={`${classNames.button} ${classNames.buttonPrimary}`}
                style={{ backgroundColor: actionColor }}
                onClick={handleConfirm}
              >
                확인
              </button>
              <button
                type="button"
                className={`${classNames.button} ${classNames.buttonSecondary}`}
                onClick={handleCancelConfirm}
              >
                취소
              </button>
            </>
          )}
          {!showConfirmModal && (
            <button
              type="button"
              className={`${classNames.button} ${classNames.buttonSecondary}`}
              onClick={onCancel}
            >
              취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
