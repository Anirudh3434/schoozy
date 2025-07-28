import { NextResponse } from "next/server";
export async function   GET( request) {
return NextResponse. json( {success: true, data:"yes" }  )
}   