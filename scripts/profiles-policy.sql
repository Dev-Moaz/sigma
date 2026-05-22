-- إضافة سياسة السماح بإنشاء ملفات تعريف شخصية جديدة (profiles) للمستخدمين المسجلين حديثاً
-- تم إعدادها لتناسب كلاً من التسجيل الفوري وتأكيد البريد الإلكتروني

CREATE POLICY "Allow public/anon insert to profiles"
ON public.profiles FOR INSERT
WITH CHECK (true);
