const formConfig = {
  'perpeptual': {
    'type': 'perpeptual',
    'js': '/creativecloud/features/cc-forms/forms/perpeptual.js',
    'blockDataset': {
      'clientname': 'trials',
      'endpoint': '/api2/marketing_common_service',
      'form-type': 'form.perpetual.action'
    }
  },
  'connect': {
    'type': 'connect'
  },
  'subscribe': {
    'type': 'subscribe'
  },
  'unsubscribe': {
    'type': 'unsubscribe'
  }
}

function getFormConfig(el) {
  switch(true) {
    case el.classList.contains('perpeptual'):
      return formConfig['perpeptual'];
    case el.classList.contains('subscribe'):
      return formConfig['subscribe'];
    default:
      return {}
  }
}

function setFormDataAttributes(el, cfg) {
  Object.keys(cfg.blockDataset).forEach((k) => {
    el.setAttribute(`data-${k}`, cfg.blockDataset[k]);
  });
}

export default async function init(el) {
  const cfg = getFormConfig(el);
  setFormDataAttributes(el, cfg);
  const {default : init} = await import(cfg['js']);
  new init(el);
}
