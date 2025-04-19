"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[24],{2024:(e,s,a)=>{a.r(s),a.d(s,{default:()=>c});var r=a(5043),t=a(342),d=a(3892),i=a(899),o=a(6727),l=a(579);const n=i.Ik().shape({email:i.Yj().email("Invalid email").required("Required")}),m=i.Ik().shape({password:i.Yj().min(8,"Password must be at least 8 characters").required("Required"),confirmPassword:i.Yj().oneOf([i.KR("password"),null],"Passwords must match").required("Required")}),c=()=>{const{requestPasswordReset:e,resetPassword:s}=(0,t.A)(),[a,i]=(0,r.useState)(""),[c]=(0,o.ok)(),u=(0,o.Zp)(),f=c.get("token");return(0,l.jsx)("div",{className:"min-h-screen flex items-center justify-center bg-[#f3f1f9]",children:(0,l.jsxs)("div",{className:"max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg",children:[(0,l.jsx)("h2",{className:"text-3xl font-bold text-[#200e4a]",children:f?"Reset Your Password":"Request Password Reset"}),a&&(0,l.jsx)("div",{className:"bg-[#461fa3] text-white p-4 rounded",children:a}),(0,l.jsx)(d.l1,{initialValues:f?{password:"",confirmPassword:""}:{email:""},validationSchema:f?m:n,onSubmit:async(a,r)=>{let{setSubmitting:t}=r;try{f?(await s(f,a.password),i("Password has been reset successfully"),setTimeout((()=>u("/login")),2e3)):(await e(a.email),i("Password reset instructions have been sent to your email"))}catch(d){i(d.message)}finally{t(!1)}},children:e=>{let{values:s,errors:a,touched:r,handleChange:t,isSubmitting:i}=e;return(0,l.jsxs)(d.lV,{className:"space-y-6",children:[f?(0,l.jsxs)(l.Fragment,{children:[(0,l.jsxs)("div",{children:[(0,l.jsx)("label",{className:"text-sm font-medium text-gray-700",children:"New Password"}),(0,l.jsx)("input",{type:"password",name:"password",value:s.password,onChange:t,className:"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"}),r.password&&a.password&&(0,l.jsx)("div",{className:"text-red-500 text-sm mt-1",children:a.password})]}),(0,l.jsxs)("div",{children:[(0,l.jsx)("label",{className:"text-sm font-medium text-gray-700",children:"Confirm New Password"}),(0,l.jsx)("input",{type:"password",name:"confirmPassword",value:s.confirmPassword,onChange:t,className:"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"}),r.confirmPassword&&a.confirmPassword&&(0,l.jsx)("div",{className:"text-red-500 text-sm mt-1",children:a.confirmPassword})]})]}):(0,l.jsxs)("div",{children:[(0,l.jsx)("label",{className:"text-sm font-medium text-gray-700",children:"Email address"}),(0,l.jsx)("input",{type:"email",name:"email",value:s.email,onChange:t,className:"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"}),r.email&&a.email&&(0,l.jsx)("div",{className:"text-red-500 text-sm mt-1",children:a.email})]}),(0,l.jsx)("button",{type:"submit",disabled:i,className:"w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#200e4a] hover:bg-[#461fa3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#461fa3]",children:i?"Processing...":f?"Reset Password":"Send Reset Instructions"})]})}})]})})}}}]);
//# sourceMappingURL=24.be1f23bb.chunk.js.map