import { useState } from "react";
import { isValidEmail, isValidPhone } from "../../lib/format";
import { CheckboxField, TextField } from "../../components/ui/Field";
import Button from "../../components/ui/Button";

function validate(customer, agreed) {
  const e = {};
  if (!customer.first_name.trim()) e.first_name = "Enter your first name.";
  if (!customer.phone.trim()) e.phone = "Enter a phone number so the shop can reach you.";
  else if (!isValidPhone(customer.phone)) e.phone = "Use 7 to 15 digits. You can include + and spaces.";
  if (customer.email.trim() && !isValidEmail(customer.email.trim())) e.email = "That email address doesn't look right.";
  if (!agreed) e.agreed = "Tick the box to continue.";
  return e;
}

export default function DetailsStep({ customer, agreed, onChange, onAgree, onSubmit }) {
  const [errors, setErrors] = useState({});

  const submit = (ev) => {
    ev.preventDefault();
    const found = validate(customer, agreed);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit();
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="font-display text-4xl font-extrabold tracking-wide">Your details</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TextField
          label="First name"
          autoComplete="given-name"
          value={customer.first_name}
          error={errors.first_name}
          onChange={(e) => onChange({ first_name: e.target.value })}
        />
        <TextField
          label="Last name"
          optional
          autoComplete="family-name"
          value={customer.last_name}
          onChange={(e) => onChange({ last_name: e.target.value })}
        />
        <div className="sm:col-span-2">
          <TextField
            label="Phone number"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 123 4567"
            hint="The shop calls or texts this number if anything changes. You also need it to find your booking later."
            value={customer.phone}
            error={errors.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <TextField
            label="Email"
            optional
            type="email"
            autoComplete="email"
            value={customer.email}
            error={errors.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-ink-50 p-4">
        <CheckboxField
          label="I understand the shop confirms this request. My time isn't guaranteed until it's approved."
          checked={agreed}
          error={errors.agreed}
          onChange={(e) => onAgree(e.target.checked)}
        />
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
        Request appointment
      </Button>
    </form>
  );
}
