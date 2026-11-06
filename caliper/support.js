'use strict';
const form=document.getElementById('caliper-support-form');
if(form){
  const file=form.querySelector('[name="attachment"]');
  const error=document.getElementById('image-error');
  const button=form.querySelector('button[type="submit"]');
  const status=document.getElementById('submit-status');
  function validateImage(){
    const image=file.files?.[0];
    const message=!image?'':image.size>5*1024*1024?'Choose a screenshot smaller than 5 MB.':!['image/png','image/jpeg'].includes(image.type)?'Choose a PNG or JPG screenshot.':'';
    file.setCustomValidity(message);error.textContent=message;error.hidden=!message;
    return !message;
  }
  file.addEventListener('change',validateImage);
  form.addEventListener('submit',event=>{
    if(!validateImage()){event.preventDefault();file.reportValidity();return;}
    if(button.disabled){event.preventDefault();return;}
    button.disabled=true;status.textContent='Opening FormSubmit’s secure submission page… If it cannot load, return here and try later.';
  });
  window.addEventListener('pageshow',()=>{button.disabled=false;status.textContent='';});
}
