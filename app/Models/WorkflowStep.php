<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowStep extends Model
{
    protected $fillable = [
        'step_number',
        'step_name',
        'step_department',
        'required_role',
    ];
}
