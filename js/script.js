/**
 * GỐM KÝ — Single-Page Brand Script
 * Tinh thần: Thủ công × Công nghệ × Câu chuyện cá nhân
 * Xử lý: IntersectionObserver active nav, smooth scroll, Shop CTA sync, EmailJS gửi mail thực tế
 */

// ==========================================================================
// 1. CẤU HÌNH EMAILJS (GỬI EMAIL THẬT ĐẾN dieuthuvtpt@gmail.com)
// ==========================================================================
// Thông tin cấu hình EmailJS gửi về dieuthuvtpt@gmail.com
const EMAILJS_SERVICE_ID = 'service_2ey39a5';
const EMAILJS_TEMPLATE_ID = '8nrqkjh';
const EMAILJS_PUBLIC_KEY = 'vS43lNfk7a2rfC35x';

// Email người nhận chính thức của Gốm Ký
const TARGET_RECIPIENT_EMAIL = 'dieuthuvtpt@gmail.com';

document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo EmailJS SDK nếu đã được nhúng và cấu hình
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  initNavigation();
  initScrollSpy();
  initShopActions();
  initFaqAccordion();
  initBookingForm();
});

// ==========================================================================
// 2. ĐIỀU HƯỚNG & MENU DI ĐỘNG
// ==========================================================================
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Đổi hiệu ứng header khi cuộn trang
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Toggle mobile drawer
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Đóng drawer khi click vào bất kỳ link nào
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

// ==========================================================================
// 3. INTERSECTION OBSERVER — ACTIVE MENU TỰ ĐỘNG KHI CUỘN
// Đảm bảo đúng 5 mục: #home, #workshop, #personalization, #shop, #booking
// ==========================================================================
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.nav-menu .nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-drawer .mobile-nav-link');

  if (!sections.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -65% 0px', // Điểm kích hoạt tối ưu khi cuộn
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        updateActiveNav(activeId);
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  function updateActiveNav(activeId) {
    desktopLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    mobileLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

// ==========================================================================
// 4. KẾT NỐI SẢN PHẨM CỬA HÀNG VỚI FORM ĐẶT LỊCH
// Bấm "Đặt mẫu này" -> tự động cuộn tới #booking & điền tên mẫu vào ghi chú
// ==========================================================================
function initShopActions() {
  const shopOrderButtons = document.querySelectorAll('.btn-order-product');
  const noteTextarea = document.getElementById('booking-notes');
  const packageSelect = document.getElementById('booking-package');

  shopOrderButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productName = btn.getAttribute('data-product-name') || 'Sản phẩm gốm cá nhân hóa';
      
      if (noteTextarea) {
        const prefix = `[Yêu cầu đặt mẫu]: ${productName}. `;
        if (!noteTextarea.value.includes(productName)) {
          noteTextarea.value = prefix + (noteTextarea.value ? `\n${noteTextarea.value}` : '');
        }
      }

      if (packageSelect) {
        // Chọn gói liên quan đến gốm cá nhân hóa nếu có
        packageSelect.value = 'custom-order';
      }

      // Cuộn mượt tới section booking
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
        // Focus nhẹ vào trường họ tên để khách dễ thao tác
        setTimeout(() => {
          const nameInput = document.getElementById('booking-name');
          if (nameInput) nameInput.focus();
        }, 600);
      }
    });
  });
}

// ==========================================================================
// 5. FAQ ACCORDION TƯƠNG TÁC
// ==========================================================================
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question-btn');
  
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.faq-card');
      const isOpen = parent.classList.contains('active');
      
      // Đóng các thẻ khác
      document.querySelectorAll('.faq-card').forEach(c => c.classList.remove('active'));
      
      if (!isOpen) {
        parent.classList.add('active');
      }
    });
  });
}

// ==========================================================================
// 6. XỬ LÝ SUBMIT FORM & GỬI EMAIL THẬT VỚI EMAILJS
// ==========================================================================
function initBookingForm() {
  const form = document.getElementById('booking-form');
  const alertSuccess = document.getElementById('form-alert-success');
  const alertError = document.getElementById('form-alert-error');
  const btnSubmit = document.getElementById('btn-booking-submit');
  const submitText = btnSubmit ? btnSubmit.querySelector('.btn-text') : null;

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ẩn các thông báo trước đó
    hideAlerts();

    // Validate form
    const isValid = validateBookingForm(form);
    if (!isValid) {
      return;
    }

    // Thu thập dữ liệu form
    const formData = {
      to_email: TARGET_RECIPIENT_EMAIL, // dieuthuvtpt@gmail.com
      from_name: form.elements['user_name'].value.trim(),
      contact_info: form.elements['user_contact'].value.trim(),
      booking_date: form.elements['booking_date'].value,
      time_slot: form.elements['time_slot'].value,
      guest_count: form.elements['guest_count'].value,
      workshop_package: form.elements['workshop_package'].options[form.elements['workshop_package'].selectedIndex].text,
      notes: form.elements['booking_notes'].value.trim() || 'Không có ghi chú thêm',
      submitted_at: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    };

    // Bật hiệu ứng loading
    setLoadingState(true);

    // Kiểm tra xem người dùng đã điền Public Key thật chưa
    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY' || EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
      console.warn('GỐM KÝ EmailJS: Chưa điền Service ID/Template ID/Public Key. Đang mô phỏng gửi thành công để bạn kiểm tra giao diện.');
      
      // Chờ 1 giây tạo trải nghiệm thực tế rồi báo thành công
      setTimeout(() => {
        setLoadingState(false);
        showSuccessMessage();
        form.reset();
      }, 1000);
      return;
    }

    // Gửi email thật qua EmailJS SDK
    try {
      if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS SDK chưa được tải.');
      }

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formData
      );

      console.log('EmailJS Gửi thành công:', response.status, response.text);
      setLoadingState(false);
      showSuccessMessage();
      form.reset();

    } catch (error) {
      console.error('EmailJS Gửi thất bại:', error);
      setLoadingState(false);
      showErrorMessage();
    }
  });

  function validateBookingForm(formEl) {
    let valid = true;
    const requiredInputs = formEl.querySelectorAll('[required]');

    requiredInputs.forEach(input => {
      input.classList.remove('is-invalid');
      if (!input.value || !input.value.trim()) {
        input.classList.add('is-invalid');
        valid = false;
      }
    });

    // Validate định dạng số điện thoại hoặc email cơ bản
    const contactInput = formEl.elements['user_contact'];
    if (contactInput && contactInput.value.trim()) {
      const val = contactInput.value.trim();
      const isPhone = /^[0-9+.\-\s]{8,15}$/.test(val);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

      if (!isPhone && !isEmail) {
        contactInput.classList.add('is-invalid');
        valid = false;
      }
    }

    if (!valid) {
      const firstInvalid = formEl.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }

    return valid;
  }

  function setLoadingState(isLoading) {
    if (!btnSubmit) return;
    if (isLoading) {
      btnSubmit.classList.add('loading');
      btnSubmit.disabled = true;
      if (submitText) submitText.textContent = 'Đang gửi yêu cầu...';
    } else {
      btnSubmit.classList.remove('loading');
      btnSubmit.disabled = false;
      if (submitText) submitText.textContent = 'Gửi yêu cầu đặt lịch';
    }
  }

  function showSuccessMessage() {
    if (alertSuccess) {
      alertSuccess.classList.add('show');
      alertSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function showErrorMessage() {
    if (alertError) {
      alertError.classList.add('show');
      alertError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function hideAlerts() {
    if (alertSuccess) alertSuccess.classList.remove('show');
    if (alertError) alertError.classList.remove('show');
  }
}
