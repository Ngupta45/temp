// Field definitions: order matches document-based table rows 0–4
// Each entry: { defaultLabel, type, name, prop }
//   prop      = data-aue-prop name for AEM authoring
//   type      = html input type, or 'textarea'
const FIELDS = [
  { defaultLabel: 'First Name',   type: 'text',     name: 'firstName',  prop: 'firstNameLabel' },
  { defaultLabel: 'Last Name',    type: 'text',     name: 'lastName',   prop: 'lastNameLabel' },
  { defaultLabel: 'Email',        type: 'email',    name: 'email',      prop: 'emailLabel' },
  { defaultLabel: 'Phone Number', type: 'tel',      name: 'phone',      prop: 'phoneLabel' },
  { defaultLabel: 'Your Query',   type: 'textarea', name: 'query',      prop: 'queryLabel' },
];

function getProp(block, propName) {
  const el = block.querySelector(`[data-aue-prop="${propName}"]`);
  return el ? el.textContent.trim() : null;
}

function getRowCells(rows, index) {
  const row = rows[index];
  if (!row) return [];
  return [...row.querySelectorAll(':scope > div')].map((c) => c.textContent.trim());
}

function buildField({ label, type, name }) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('enquiry-form__field');

  const labelEl = document.createElement('label');
  labelEl.setAttribute('for', `ef-${name}`);
  labelEl.textContent = label;

  let input;
  if (type === 'textarea') {
    input = document.createElement('textarea');
    input.rows = 5;
  } else {
    input = document.createElement('input');
    input.type = type;
  }
  input.id = `ef-${name}`;
  input.name = name;
  input.placeholder = label;

  wrapper.append(labelEl, input);
  return wrapper;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Resolve authored values — AEM props take priority, then doc-based rows, then defaults
  const fields = FIELDS.map((field, i) => {
    const cells = getRowCells(rows, i);
    const label = getProp(block, field.prop) || cells[0] || field.defaultLabel;
    return { ...field, label };
  });

  // Submit row is the last row (index 5)
  const submitCells = getRowCells(rows, FIELDS.length);
  const submitText = getProp(block, 'submitText') || submitCells[0] || 'Submit';
  const submitLink = getProp(block, 'submitLink') || submitCells[1] || '#';

  // Build form
  const form = document.createElement('form');
  form.classList.add('enquiry-form__form');
  form.action = submitLink;
  form.method = 'post';
  form.noValidate = true;

  fields.forEach((field) => form.append(buildField(field)));

  const submitWrapper = document.createElement('div');
  submitWrapper.classList.add('enquiry-form__submit');

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = submitText;
  submitWrapper.append(button);
  form.append(submitWrapper);

  block.innerHTML = '';
  block.append(form);
}
