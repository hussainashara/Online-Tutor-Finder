alert("working");
let dropdownBtn = document.getElementById('login');
      let dropdownmenu = document.getElementById('dropdownmenu');
      dropdownBtn.addEventListener('click',()=>{
         if(dropdownmenu.style.display===""){
          dropdownmenu.style.display="block";
          dropdownBtn.style.borderBottomLeftRadius="0px";
          dropdownBtn.style.borderBottomRightRadius="0px";
          dropdownBtn.style.borderTopLeftRadius="18px";
          dropdownBtn.style.borderTopRightRadius="18px";
          dropdownBtn.style.backgroundColor="white";
          dropdownBtn.style.borderBottom="none";
          dropdownBtn.style.height="45px";
      
          // dropdownBtn.style.background-color="white";
         } else {
          dropdownmenu.style.display="";
          dropdownBtn.style.border="0.8px solid  rgb(61, 69, 73)";
          dropdownBtn.style.borderBottomLeftRadius="50px";
          dropdownBtn.style.borderBottomRightRadius="50px";
          dropdownBtn.style.borderTopLeftRadius="50px";
          dropdownBtn.style.borderTopRightRadius="50px";
          dropdownBtn.style.height="35px";
         }
      })