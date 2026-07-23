/**
 * LEAP Growth — reusable form validation (shared across landing & assessment pages).
 */
(function (global) {
  'use strict';

  const PHONE_LENGTH = 10;
  const NAME_MIN = 2;
  const NAME_MAX = 100;
  const MESSAGE_MAX = 500;
  const NICHE_MIN = 2;
  const NICHE_MAX = 100;
  const NAME_REGEX = /^[A-Za-z\s'-]+$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validators = {
    name(value) {
      const v = String(value || '').trim();
      if (!v) return 'Name is required.';
      if (v.length < NAME_MIN) return 'Name must be at least 2 characters.';
      if (v.length > NAME_MAX) return 'Name must be no more than 100 characters.';
      if (!NAME_REGEX.test(v)) return 'Name may only contain letters, spaces, apostrophes, and hyphens.';
      return '';
    },
    email(value) {
      const v = String(value || '').trim();
      if (!v) return 'Email is required.';
      if (!EMAIL_REGEX.test(v)) return 'Please enter a valid email address.';
      return '';
    },
    phone(value) {
      const digits = String(value || '').replace(/\D/g, '');
      if (!digits) return 'Phone number is required.';
      if (digits.length !== PHONE_LENGTH) return 'Phone number must be exactly 10 digits.';
      return '';
    },
    niche(value) {
      const v = String(value || '').trim();
      if (!v) return 'This field is required.';
      if (v.length < NICHE_MIN) return 'Please enter at least 2 characters.';
      if (v.length > NICHE_MAX) return 'Must be no more than 100 characters.';
      return '';
    },
    message(value) {
      const v = String(value || '').trim();
      if (v.length > MESSAGE_MAX) return 'Message must be no more than 500 characters.';
      return '';
    },
    select(value) {
      const v = String(value || '').trim();
      if (!v) return 'Please select an option.';
      return '';
    }
  };

  function injectStyles() {
    if (document.getElementById('leap-form-validation-styles')) return;
    const style = document.createElement('style');
    style.id = 'leap-form-validation-styles';
    style.textContent =
      '.field input.field-invalid,.field select.field-invalid,.field textarea.field-invalid{' +
      'border-color:#c03030!important;background:#fef0f0!important;}' +
      '.field-error-msg{display:block;font-size:12px;color:#c03030;margin-top:6px;line-height:1.4;}';
    document.head.appendChild(style);
  }

  function getFieldWrapper(input) {
    return input.closest('.field') || input.parentElement;
  }

  function getErrorEl(input) {
    const wrapper = getFieldWrapper(input);
    let err = wrapper.querySelector('.field-error-msg');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-error-msg';
      err.id = input.id + '-error';
      err.setAttribute('role', 'alert');
      wrapper.appendChild(err);
    }
    return err;
  }

  function showError(input, message) {
    input.classList.add('field-invalid');
    input.setAttribute('aria-invalid', 'true');
    const err = getErrorEl(input);
    err.textContent = message;
    input.setAttribute('aria-describedby', err.id);
  }

  function clearError(input) {
    if (!input) return;
    input.classList.remove('field-invalid');
    input.setAttribute('aria-invalid', 'false');
    const wrapper = getFieldWrapper(input);
    const err = wrapper && wrapper.querySelector('.field-error-msg');
    if (err) err.textContent = '';
    input.removeAttribute('aria-describedby');
  }

  function normalizeValue(type, raw) {
    if (type === 'phone') return String(raw || '').replace(/\D/g, '');
    return String(raw || '').trim();
  }

  /**
   * Validate configured fields. Returns { valid, values, firstInvalid }.
   * @param {Array<{id:string,type:keyof validators,required?:boolean}>} fields
   */
  function validateForm(fields) {
    let firstInvalid = null;
    const values = {};
    let valid = true;

    fields.forEach(function (field) {
      const input = document.getElementById(field.id);
      if (!input) return;

      const required = field.required !== false;
      const type = field.type;
      const validator = validators[type];
      clearError(input);

      if (!validator) return;

      const raw = input.value;
      const error = validator(raw);
      const isEmpty = !String(raw || '').trim();

      if (type === 'message' && !required) {
        if (error) {
          valid = false;
          showError(input, error);
          if (!firstInvalid) firstInvalid = input;
        } else {
          values[field.id] = normalizeValue(type, raw);
        }
        return;
      }

      if (required && isEmpty) {
        valid = false;
        showError(input, error || 'This field is required.');
        if (!firstInvalid) firstInvalid = input;
        return;
      }

      if (error) {
        valid = false;
        showError(input, error);
        if (!firstInvalid) firstInvalid = input;
        return;
      }

      values[field.id] = normalizeValue(type, raw);
    });

    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return { valid: valid, values: values, firstInvalid: firstInvalid };
  }

  function bindPhoneInput(input) {
    if (!input || input.dataset.leapPhoneBound) return;
    input.dataset.leapPhoneBound = '1';

    input.addEventListener('input', function () {
      const digits = input.value.replace(/\D/g, '').slice(0, PHONE_LENGTH);
      if (input.value !== digits) input.value = digits;
      if (input.classList.contains('field-invalid') && !validators.phone(digits)) {
        clearError(input);
      }
    });

    input.addEventListener('keydown', function (e) {
      if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
    });
  }

  function bindLiveValidation(fields) {
    fields.forEach(function (field) {
      const input = document.getElementById(field.id);
      if (!input) return;

      const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(eventType, function () {
        const validator = validators[field.type];
        if (!validator) return;
        const error = validator(input.value);
        if (error) showError(input, error);
        else clearError(input);
      });

      if (field.type === 'phone') bindPhoneInput(input);
    });
  }

  function clearFormFields(fieldIds) {
    fieldIds.forEach(function (id) {
      const input = document.getElementById(id);
      if (!input) return;
      if (input.tagName === 'SELECT') input.selectedIndex = 0;
      else input.value = '';
      clearError(input);
    });
  }

  injectStyles();

  global.LeapForm = {
    PHONE_LENGTH: PHONE_LENGTH,
    validateForm: validateForm,
    bindLiveValidation: bindLiveValidation,
    bindPhoneInput: bindPhoneInput,
    clearFormFields: clearFormFields,
    clearError: clearError,
    showError: showError
  };
})(window);
