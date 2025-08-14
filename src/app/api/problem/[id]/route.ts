"use server";

import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const response = await axios.get(
            `${process.env.LEETCODE_BASE_URL}/${id}`
        );

        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: error.response?.status || 500 }
        );
    }
}
