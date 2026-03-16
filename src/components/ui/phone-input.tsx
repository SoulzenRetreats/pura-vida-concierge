import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { cn } from "@/lib/utils";

interface InternationalPhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  className?: string;
}

export const InternationalPhoneInput = ({
  value,
  onChange,
  className,
}: InternationalPhoneInputProps) => {
  return (
    <PhoneInput
      defaultCountry="us"
      preferredCountries={["us", "cr", "mx", "ca"]}
      value={value}
      onChange={onChange}
      className={cn("phone-input-container", className)}
      inputClassName="phone-input-field"
      countrySelectorStyleProps={{
        buttonClassName: "phone-input-country-btn",
      }}
    />
  );
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone || phone.length <= 3) return true; // empty is OK (optional field)
  const digits = phone.replace(/[^0-9]/g, "");
  return phone.startsWith("+") && digits.length >= 8 && digits.length <= 15;
};
