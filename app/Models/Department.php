<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    /** Table name in the database (users.dep_id references this table). */
    // protected $table = 'department';

    protected $fillable = ['name', 'name_ar'];

    /**
     * @return HasMany<User>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'dep_id');
    }
}
