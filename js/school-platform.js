const schoolPackages = [
  {
    id: 'package-1',
    name: 'Package 1',
    price: 250,
    description: 'A keepsake-ready bundle featuring framed, laminated and personalised items.',
    items: [
      'A4 canvas',
      'A4 laminated photo',
      '2 small photos',
      '1 personalised mug',
      '2 keyrings'
    ]
  },
  {
    id: 'package-2',
    name: 'Package 2',
    price: 300,
    description: 'A larger premium bundle with a statement print and classic keepsakes.',
    items: [
      'A3 canvas',
      'A4 laminated photo',
      '2 small photos',
      '1 personalised mug',
      '2 keyrings'
    ]
  }
];

const mockLearners = [
  {
    id: 'learner-1',
    learnerRef: 'MCM-2401',
    pin: '1234',
    name: 'Ava Mokoena',
    school: 'Northview Primary',
    grade: 'Grade 5A',
    gallery: [
      { id: 'p1', title: 'Studio portrait', src: 'img/portfolio-1.jpg' },
      { id: 'p2', title: 'School portrait', src: 'img/portfolio-2.jpg' },
      { id: 'p3', title: 'Creative pose', src: 'img/portfolio-3.jpg' },
      { id: 'p4', title: 'School day memory', src: 'img/portfolio-4.jpg' },
      { id: 'p5', title: 'Class photo mood', src: 'img/portfolio-5.jpg' },
      { id: 'p6', title: 'Natural light portrait', src: 'img/portfolio-6.jpg' }
    ]
  },
  {
    id: 'learner-2',
    learnerRef: 'MCM-2714',
    pin: '5678',
    name: 'Liam Nkosi',
    school: 'Riverside Academy',
    grade: 'Grade 4C',
    gallery: [
      { id: 'q1', title: 'Portrait preview', src: 'img/portfolio-7.jpg' },
      { id: 'q2', title: 'Smile study', src: 'img/portfolio-8.jpg' },
      { id: 'q3', title: 'School day portrait', src: 'img/hero-1.jpg' },
      { id: 'q4', title: 'Moment in profile', src: 'img/hero-2.jpg' },
      { id: 'q5', title: 'Warm light frame', src: 'img/hero-3.jpg' },
      { id: 'q6', title: 'Outdoor portrait', src: 'img/hero-4.jpg' }
    ]
  }
];

const mockSchools = [
  { name: 'Northview Primary', learners: 340, project: 'Spring Portraits' },
  { name: 'Riverside Academy', learners: 420, project: 'Autumn Portraits' },
  { name: 'Greenwood College', learners: 290, project: 'Campus Portrait Day' },
  { name: 'Hillcrest Prep', learners: 260, project: 'Foundation Photo Day' }
];

const mockOrders = [
  {
    reference: 'MCM-ORD-2041',
    learnerName: 'Ava Mokoena',
    packageName: 'Package 1',
    total: 'R250',
    status: 'Awaiting payment verification',
    stages: [
      'Order submitted',
      'Awaiting payment verification',
      'Awaiting production',
      'In production',
      'Quality check',
      'Ready for collection or dispatch',
      'Delivered'
    ],
    progress: 2
  },
  {
    reference: 'MCM-ORD-1986',
    learnerName: 'Liam Nkosi',
    packageName: 'Package 2',
    total: 'R300',
    status: 'Quality check',
    stages: [
      'Order submitted',
      'Awaiting payment verification',
      'Awaiting production',
      'In production',
      'Quality check',
      'Ready for collection or dispatch',
      'Delivered'
    ],
    progress: 5
  }
];

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function getPackageById(packageId) {
  return schoolPackages.find((pkg) => pkg.id === packageId) || schoolPackages[0];
}

function getLearnerByReference(reference) {
  return mockLearners.find((learner) => learner.learnerRef.toLowerCase() === reference.toLowerCase());
}

function getCurrentLearner() {
  const searchRef = new URLSearchParams(window.location.search).get('ref');
  const stored = readStorage('mcm-school-access', null);
  const reference = searchRef || (stored && stored.learnerRef) || null;
  if (!reference) {
    return null;
  }

  return getLearnerByReference(reference);
}

function renderPackageCards(container, packages, mode) {
  if (!container) {
    return;
  }

  const selectedPackageId = readStorage('mcm-school-selected-package', packages[0].id);
  container.innerHTML = packages.map((pkg) => {
    const isActive = pkg.id === selectedPackageId;
    const btnTag = mode === 'checkout' ? 'button' : 'div';
    const buttonClass = mode === 'checkout' ? 'package-card' : 'package-card package-card--compact';
    return `
      <${btnTag} type="${mode === 'checkout' ? 'button' : 'div'}" class="${buttonClass} ${isActive ? 'selected' : ''}" data-package-select="${pkg.id}">
        <span class="package-badge">${pkg.name}</span>
        <h3>R${pkg.price}</h3>
        <p>${pkg.description}</p>
        <ul>
          ${pkg.items.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </${btnTag}>
    `;
  }).join('');
}

function renderSelectedPackageSummary() {
  const packageId = readStorage('mcm-school-selected-package', schoolPackages[0].id);
  const selectedPackage = getPackageById(packageId);
  const selectedPhotos = readStorage('mcm-school-gallery-selection', []);
  const subtotal = selectedPackage.price;
  const photoCount = selectedPhotos.length || 0;

  const summaryRoot = document.querySelector('[data-checkout-summary]');
  if (!summaryRoot) {
    return;
  }

  summaryRoot.innerHTML = `
    <div class="summary-header">
      <p class="text-primary text-uppercase mb-2">Order summary</p>
      <h3>${selectedPackage.name}</h3>
    </div>
    <div class="summary-row">
      <span>Package</span>
      <strong>R${selectedPackage.price}</strong>
    </div>
    <div class="summary-row">
      <span>Selected photos</span>
      <strong>${photoCount}</strong>
    </div>
    <div class="summary-row">
      <span>Processing fee</span>
      <strong>R0</strong>
    </div>
    <div class="summary-row summary-row--total">
      <span>Total</span>
      <strong>R${subtotal}</strong>
    </div>
  `;
}

function renderGallery(learner) {
  const galleryRoot = document.querySelector('[data-learner-gallery]');
  const selectedCount = document.querySelector('[data-selected-count]');
  const selectedPhotos = readStorage('mcm-school-gallery-selection', []);

  if (!galleryRoot) {
    return;
  }

  galleryRoot.innerHTML = learner.gallery.map((photo) => {
    const isSelected = selectedPhotos.includes(photo.id);
    return `
      <div class="col-md-6 col-lg-4">
        <button type="button" class="gallery-photo-card ${isSelected ? 'selected' : ''}" data-photo-id="${photo.id}">
          <img src="${photo.src}" alt="${photo.title}">
          <div class="gallery-photo-card__meta">
            <span>${photo.title}</span>
            <i class="fa ${isSelected ? 'fa-check-circle' : 'fa-plus-circle'}"></i>
          </div>
        </button>
      </div>
    `;
  }).join('');

  if (selectedCount) {
    selectedCount.textContent = selectedPhotos.length;
  }
}

function setAccessState(learner) {
  writeStorage('mcm-school-access', { learnerRef: learner.learnerRef });
}

function updateGallerySelection(photoId) {
  const currentSelection = readStorage('mcm-school-gallery-selection', []);
  const exists = currentSelection.includes(photoId);
  const nextSelection = exists
    ? currentSelection.filter((id) => id !== photoId)
    : currentSelection.concat(photoId);

  writeStorage('mcm-school-gallery-selection', nextSelection);

  const selectedCount = document.querySelector('[data-selected-count]');
  if (selectedCount) {
    selectedCount.textContent = nextSelection.length;
  }

  const galleryCards = document.querySelectorAll('[data-photo-id]');
  galleryCards.forEach((card) => {
    const id = card.getAttribute('data-photo-id');
    const isSelected = nextSelection.includes(id);
    card.classList.toggle('selected', isSelected);
    const icon = card.querySelector('i');
    if (icon) {
      icon.className = `fa ${isSelected ? 'fa-check-circle' : 'fa-plus-circle'}`;
    }
  });
}

function renderAdminDashboard() {
  const overviewRoot = document.querySelector('[data-admin-overview]');
  const schoolTable = document.querySelector('[data-school-table]');
  const learnerTable = document.querySelector('[data-learner-table]');
  const orderTable = document.querySelector('[data-order-table]');

  if (overviewRoot) {
    const metricCards = [
      { label: 'Total schools', value: '14', accent: 'primary' },
      { label: 'Total learners', value: '2,430', accent: 'secondary' },
      { label: 'Total photographs', value: '18,420', accent: 'primary' },
      { label: 'Total orders', value: '1,286', accent: 'secondary' },
      { label: 'Pending payments', value: '94', accent: 'warning' },
      { label: 'Orders in production', value: '58', accent: 'primary' },
      { label: 'Completed orders', value: '1,112', accent: 'success' }
    ];

    overviewRoot.innerHTML = metricCards.map((metric) => `
      <div class="col-md-6 col-xl-3">
        <div class="admin-stat-card admin-stat-card--${metric.accent}">
          <span>${metric.label}</span>
          <strong>${metric.value}</strong>
        </div>
      </div>
    `).join('');
  }

  if (schoolTable) {
    schoolTable.innerHTML = mockSchools.map((school) => `
      <tr>
        <td>${school.name}</td>
        <td>${school.learners}</td>
        <td>${school.project}</td>
        <td><button class="table-action">View</button></td>
      </tr>
    `).join('');
  }

  if (learnerTable) {
    learnerTable.innerHTML = mockLearners.map((learner) => `
      <tr>
        <td>${learner.name}</td>
        <td>${learner.school}</td>
        <td>${learner.grade}</td>
        <td>${learner.learnerRef}</td>
      </tr>
    `).join('');
  }

  if (orderTable) {
    orderTable.innerHTML = mockOrders.map((order) => `
      <tr>
        <td>${order.reference}</td>
        <td>${order.learnerName}</td>
        <td>${order.packageName}</td>
        <td>${order.status}</td>
      </tr>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const packageList = document.querySelector('[data-package-list]');
  if (packageList) {
    renderPackageCards(packageList, schoolPackages, 'landing');
  }

  const packageSelector = document.querySelector('[data-package-selector]');
  if (packageSelector) {
    renderPackageCards(packageSelector, schoolPackages, 'checkout');
  }

  const accessForm = document.querySelector('#parentAccessForm');
  if (accessForm) {
    accessForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(accessForm);
      const learnerRef = String(formData.get('learnerRef') || '').trim();
      const pin = String(formData.get('pin') || '').trim();
      const learner = getLearnerByReference(learnerRef);

      const statusText = document.querySelector('[data-access-status]');
      if (!learner || learner.pin !== pin) {
        if (statusText) {
          statusText.textContent = 'The learner reference or private PIN is incorrect. Please try again.';
          statusText.classList.add('text-danger');
        }
        return;
      }

      setAccessState(learner);
      writeStorage('mcm-school-gallery-selection', []);
      window.location.href = `school-gallery.html?ref=${encodeURIComponent(learner.learnerRef)}`;
    });
  }

  const learnerGallery = document.querySelector('[data-learner-gallery]');
  const learner = getCurrentLearner();
  if (learnerGallery && learner) {
    renderGallery(learner);
  }

  const gallerySelector = document.querySelector('[data-learner-gallery]');
  if (gallerySelector) {
    gallerySelector.addEventListener('click', (event) => {
      const button = event.target.closest('[data-photo-id]');
      if (!button) {
        return;
      }
      updateGallerySelection(button.getAttribute('data-photo-id'));
    });
  }

  const orderForm = document.querySelector('#checkoutForm');
  if (orderForm) {
    const learnerInfo = getCurrentLearner();
    const learnerNameField = orderForm.querySelector('#guardianName');
    if (learnerInfo && learnerNameField) {
      learnerNameField.value = 'Parent/Guardian';
    }

    renderSelectedPackageSummary();

    orderForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(orderForm);
      const packageId = readStorage('mcm-school-selected-package', schoolPackages[0].id);
      const selectedPackage = getPackageById(packageId);
      const selectedPhotos = readStorage('mcm-school-gallery-selection', []);
      const orderReference = `MCM-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const order = {
        reference: orderReference,
        learnerName: learnerInfo ? learnerInfo.name : 'Example learner',
        packageName: selectedPackage.name,
        total: `R${selectedPackage.price}`,
        status: 'Order submitted',
        stages: [
          'Order submitted',
          'Awaiting payment verification',
          'Awaiting production',
          'In production',
          'Quality check',
          'Ready for collection or dispatch',
          'Delivered'
        ],
        progress: 1,
        selectedPhotos: selectedPhotos.length,
        contactName: String(formData.get('guardianName') || '')
      };

      const orders = readStorage('mcm-school-orders', []);
      orders.unshift(order);
      writeStorage('mcm-school-orders', orders);
      window.location.href = `school-order-tracking.html?ref=${encodeURIComponent(order.reference)}`;
    });
  }

  document.querySelectorAll('[data-package-select]').forEach((button) => {
    button.addEventListener('click', () => {
      const packageId = button.getAttribute('data-package-select');
      writeStorage('mcm-school-selected-package', packageId);
      renderSelectedPackageSummary();
      if (document.querySelector('[data-package-selector]')) {
        renderPackageCards(document.querySelector('[data-package-selector]'), schoolPackages, 'checkout');
      }
    });
  });

  const trackingForm = document.querySelector('#orderTrackingForm');
  if (trackingForm) {
    const paramReference = new URLSearchParams(window.location.search).get('ref');
    const referenceInput = trackingForm.querySelector('#orderReference');
    if (paramReference && referenceInput) {
      referenceInput.value = paramReference;
    }

    const lookup = (value) => {
      const orders = readStorage('mcm-school-orders', mockOrders);
      return orders.find((order) => order.reference.toLowerCase() === value.toLowerCase());
    };

    trackingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(trackingForm);
      const value = String(formData.get('orderReference') || '').trim();
      const statusContainer = document.querySelector('[data-order-status]');
      if (!statusContainer) {
        return;
      }

      const order = lookup(value) || mockOrders[0];
      if (!order) {
        statusContainer.innerHTML = '<p class="text-danger">No matching order was found.</p>';
        return;
      }

      const currentStatus = order.status || order.stages[order.progress || 0];
      statusContainer.innerHTML = `
        <div class="order-status-card">
          <p class="text-primary text-uppercase mb-2">Order tracking</p>
          <h3>${order.reference}</h3>
          <p class="mb-4">Current status: <strong>${currentStatus}</strong></p>
          <div class="status-timeline">
            ${order.stages.map((stage, index) => `
              <div class="status-step ${index <= (order.progress || 0) ? 'active' : ''}">
                <span>${index + 1}</span>
                <p>${stage}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });
  }

  const adminDashboard = document.querySelector('[data-admin-dashboard]');
  if (adminDashboard) {
    renderAdminDashboard();
  }
});
