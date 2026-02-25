<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form request for creating a new purchase request.
 * Laravel validates the submitted data before calling the controller.
 */
class StorePurchaseRequest extends FormRequest
{
    /**
     * Whether the user is authorized to submit this request.
     * Yes; authentication is enforced by route middleware.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules. Key = form field name, value = rules.
     */
    public function rules(): array
    {
        return [
            'material' => ['required', 'string', 'max:255'],
            'specifications' => ['nullable', 'string'],
            'estimated_price' => ['nullable', 'numeric', 'min:0'],
            'pickup_location' => ['nullable', 'string', 'max:255'],
            'request_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'in:pending,approved,rejected'],
        ];
    }

    /**
     * Custom validation error messages (Arabic).
     */
    public function messages(): array
    {
        return [
            'material.required' => 'حقل المادة مطلوب.',
            'material.max' => 'اسم المادة يجب ألا يتجاوز 255 حرفاً.',
            'estimated_price.numeric' => 'السعر التقديري يجب أن يكون رقماً.',
            'estimated_price.min' => 'السعر التقديري يجب أن يكون أكبر من أو يساوي صفراً.',
            'request_date.date' => 'تاريخ الطلب غير صالح.',
            'status.in' => 'حالة الطلب غير صالحة.',
        ];
    }
}
